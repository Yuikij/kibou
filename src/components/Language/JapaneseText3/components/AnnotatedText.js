import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { generateAriaLabels } from '../utils/accessibility';
import styles from './AnnotatedText.module.css';

/**
 * Component for rendering text with furigana annotations and note highlights
 */
const AnnotatedText = memo(({ 
  text,
  segments,
  annotation = {},
  notes = {},
  sentenceIndex,
  preferences,
  registerNoteRef,
  className = ''
}) => {
  const [activeWordIndex, setActiveWordIndex] = useState(null); // 用于注音悬停高亮
  const [activeNoteIndex, setActiveNoteIndex] = useState(null); // 用于笔记面板显示
  const containerRef = useRef(null);
  
  const showFurigana = preferences.display?.showFurigana ?? true;
  const showNotes = preferences.display?.showNotes ?? true;
  const fontSize = preferences.typography?.fontSize ?? 'medium';
  const lineSpacing = preferences.typography?.lineSpacing ?? 'normal';

  const handleWordMouseEnter = useCallback((wordIndex) => {
    setActiveWordIndex(wordIndex);
  }, []);

  const handleWordMouseLeave = useCallback(() => {
    setActiveWordIndex(null);
  }, []);

  // 点击空白处关闭笔记 + ESC键关闭笔记
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果没有活动的笔记，无需处理
      if (!activeNoteIndex) return;
      
      // 如果点击的是笔记面板内部，不关闭
      if (event.target.closest(`.${styles.inlineNotePanel}`)) {
        return;
      }
      
      // 如果点击的是笔记高亮文本本身，不关闭
      if (event.target.closest(`.${styles.noteHighlight}`)) {
        return;
      }
      
      // 其他情况都关闭笔记
      setActiveNoteIndex(null);
    };

    const handleKeyDown = (event) => {
      // ESC键关闭笔记
      if (event.key === 'Escape' && activeNoteIndex) {
        setActiveNoteIndex(null);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // 添加全局监听器
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeNoteIndex]);

  const renderSegment = (segment, segmentIndex) => {
    const { text: segmentText, type, data, position } = segment;
    
    switch (type) {
      case 'annotation':
        return renderAnnotatedWord(segmentText, data, segmentIndex);
      case 'note':
        return renderNoteHighlight(segmentText, data, segmentIndex, position);
      case 'plain':
      default:
        return renderPlainText(segmentText, segmentIndex);
    }
  };

  const renderAnnotatedWord = (word, furigana, wordIndex) => {
    const currentWordIndex = `${sentenceIndex}-${wordIndex}`;
    const isActive = activeWordIndex === currentWordIndex;
    const ariaLabel = generateAriaLabels.annotatedText(word, furigana);

    return (
      <span
        key={`annotated-${wordIndex}`}
        className={`${styles.annotatedWord} ${isActive ? styles.active : ''}`}
        onMouseEnter={() => handleWordMouseEnter(currentWordIndex)}
        onMouseLeave={handleWordMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
      >
        <ruby className={styles.ruby}>
          <span className={styles.kanjiText}>{word}</span>
          {showFurigana && (
            <rt className={`${styles.rubyText} ${isActive ? styles.rubyTextActive : ''}`}>
              {furigana}
            </rt>
          )}
        </ruby>
      </span>
    );
  };

  const renderNoteHighlight = (noteText, noteData, noteIndex, position) => {
    const noteKey = `${noteText}_${position}`;
    const noteContent = typeof noteData === 'string' ? noteData : noteData.content;
    const noteType = typeof noteData === 'object' ? noteData.type : 'vocabulary';
    const ariaLabel = generateAriaLabels.noteHighlight(noteText, noteContent);
    
    // Check if this note is currently active
    const isActive = activeNoteIndex === `note-${sentenceIndex}-${noteIndex}`;

    // Dynamic position adjustment for panel
    const getPanelStyle = () => {
      if (!isActive) return {};
      
      const viewportWidth = window.innerWidth;
      const panelWidth = 300; // 预估面板宽度
      
      // 简单的边界检测
      const rect = document.querySelector(`[data-note-key="${noteKey}"]`)?.getBoundingClientRect();
      if (rect) {
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        
        if (spaceRight < panelWidth && spaceLeft > panelWidth) {
          // 右侧空间不足，左侧有空间，向左偏移
          return { left: 'auto', right: '0' };
        }
      }
      
      return {};
    };

    return (
      <span
        key={`note-${noteIndex}`}
        className={`${styles.noteHighlight} ${styles[`noteType-${noteType}`] || ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Toggle note visibility
          if (isActive) {
            setActiveNoteIndex(null);
          } else {
            setActiveNoteIndex(`note-${sentenceIndex}-${noteIndex}`);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Toggle note visibility
            if (isActive) {
              setActiveNoteIndex(null);
            } else {
              setActiveNoteIndex(`note-${sentenceIndex}-${noteIndex}`);
            }
          }
        }}
        ref={(el) => registerNoteRef && registerNoteRef(sentenceIndex, noteKey, el)}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        data-note-type={noteType}
        data-note-key={noteKey}
        style={{ position: 'relative' }}
      >
        {noteText}
        
        {/* Inline note panel with relative positioning */}
        {isActive && (
          <div className={styles.inlineNotePanel} style={getPanelStyle()}>
            <div className={styles.notePanelArrow} />
            <div className={styles.notePanelContent}>
              <div className={styles.notePanelHeader}>
                <span className={styles.noteTypeIcon}>
                  {noteType === 'vocabulary' ? '📚' : 
                   noteType === 'grammar' ? '📝' : 
                   noteType === 'cultural' ? '🏮' : 
                   noteType === 'pronunciation' ? '🔊' : '💡'}
                </span>
                <strong>{noteText}</strong>
                <button 
                  className={styles.closeNoteButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveNoteIndex(null);
                  }}
                  aria-label="关闭笔记"
                >
                  ×
                </button>
              </div>
              <div className={styles.notePanelBody}>
                {noteContent}
              </div>
            </div>
          </div>
        )}
      </span>
    );
  };

  const renderPlainText = (plainText, textIndex) => {
    return (
      <span key={`plain-${textIndex}`} className={styles.plainText}>
        {plainText}
      </span>
    );
  };

  // Fallback rendering if segments are not available
  const renderFallback = () => {
    if (!annotation || Object.keys(annotation).length === 0) {
      // Check for notes in plain text
      const noteKeys = Object.keys(notes);
      if (noteKeys.length === 0) {
        return <span className={styles.plainText}>{text}</span>;
      }
      
      // Simple note highlighting for fallback
      let result = [];
      let currentIndex = 0;
      
      noteKeys.forEach((noteKey, index) => {
        const noteText = noteKey.includes('_') ? noteKey.split('_')[0] : noteKey;
        const noteIndex = text.indexOf(noteText, currentIndex);
        
        if (noteIndex !== -1) {
          // Add text before note
          if (noteIndex > currentIndex) {
            result.push(
              <span key={`text-${index}`} className={styles.plainText}>
                {text.substring(currentIndex, noteIndex)}
              </span>
            );
          }
          
          // Add note highlight
          result.push(renderNoteHighlight(noteText, notes[noteKey], index, noteIndex));
          currentIndex = noteIndex + noteText.length;
        }
      });
      
      // Add remaining text
      if (currentIndex < text.length) {
        result.push(
          <span key="text-end" className={styles.plainText}>
            {text.substring(currentIndex)}
          </span>
        );
      }
      
      return result;
    }
    
    // Handle annotations without segments
    let result = [];
    let currentIndex = 0;
    let wordIndex = 0;
    
    Object.keys(annotation).forEach((word) => {
      const index = text.indexOf(word, currentIndex);
      if (index !== -1) {
        // Add text before annotation
        if (index > currentIndex) {
          result.push(
            <span key={`plain-${index}`} className={styles.plainText}>
              {text.substring(currentIndex, index)}
            </span>
          );
        }
        
        // Add annotated word
        result.push(renderAnnotatedWord(word, annotation[word], wordIndex));
        
        currentIndex = index + word.length;
        wordIndex++;
      }
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      result.push(
        <span key="plain-end" className={styles.plainText}>
          {text.substring(currentIndex)}
        </span>
      );
    }
    
    return result;
  };

  return (
    <div 
      ref={containerRef}
      className={`
        ${styles.textContent} 
        ${styles[`fontSize-${fontSize}`] || ''} 
        ${styles[`lineSpacing-${lineSpacing}`] || ''}
        ${className}
      `}
      role="text"
      aria-label={`日文文本: ${text}`}
      data-sentence-index={sentenceIndex}
    >
      {segments && segments.length > 0 
        ? segments.map(renderSegment)
        : renderFallback()
      }
    </div>
  );
});

AnnotatedText.displayName = 'AnnotatedText';

export default AnnotatedText;