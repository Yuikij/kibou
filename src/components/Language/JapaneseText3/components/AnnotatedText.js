import React, { memo, useState, useCallback } from 'react';
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
  onNoteClick,
  registerNoteRef,
  className = ''
}) => {
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  
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

  const handleNoteClick = useCallback((noteKey, noteContent, event) => {
    if (!showNotes || !onNoteClick) return;
    onNoteClick(noteKey, noteContent, event, sentenceIndex);
  }, [showNotes, onNoteClick, sentenceIndex]);

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

    return (
      <span
        key={`note-${noteIndex}`}
        className={`${styles.noteHighlight} ${styles[`noteType-${noteType}`] || ''}`}
        onClick={(e) => handleNoteClick(noteKey, noteData, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNoteClick(noteKey, noteData, e);
          }
        }}
        ref={(el) => registerNoteRef && registerNoteRef(sentenceIndex, noteKey, el)}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        data-note-type={noteType}
      >
        {noteText}
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