import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AnnotatedText.module.css';

/**
 * Renders text with furigana annotations and clickable note highlights
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
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [activeNoteIndex, setActiveNoteIndex] = useState(null);
  const containerRef = useRef(null);

  const showFurigana = preferences.display?.showFurigana ?? true;
  const showNotes = preferences.display?.showNotes ?? true;
  const fontSize = preferences.typography?.fontSize ?? 'medium';
  const lineSpacing = preferences.typography?.lineSpacing ?? 'normal';

  const handleWordEnter = useCallback((idx) => setActiveWordIndex(idx), []);
  const handleWordLeave = useCallback(() => setActiveWordIndex(null), []);

  // Close note on click outside or Escape
  useEffect(() => {
    if (!activeNoteIndex) return;

    const onClickOutside = (e) => {
      if (e.target.closest(`.${styles.inlineNotePanel}`) || e.target.closest(`.${styles.noteHighlight}`)) return;
      setActiveNoteIndex(null);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveNoteIndex(null);
        e.preventDefault();
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activeNoteIndex]);

  const toggleNote = useCallback((noteId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveNoteIndex(prev => prev === noteId ? null : noteId);
  }, []);

  const renderSegment = (segment, segmentIndex) => {
    const { text: segText, type, data, position } = segment;
    switch (type) {
      case 'annotation': return renderAnnotated(segText, data, segmentIndex);
      case 'note': return renderNote(segText, data, segmentIndex, position);
      default: return <span key={`p-${segmentIndex}`} className={styles.plainText}>{segText}</span>;
    }
  };

  const renderAnnotated = (word, furigana, wordIndex) => {
    const id = `${sentenceIndex}-${wordIndex}`;
    const isActive = activeWordIndex === id;

    return (
      <span
        key={`a-${wordIndex}`}
        className={`${styles.annotatedWord} ${isActive ? styles.active : ''}`}
        onMouseEnter={() => handleWordEnter(id)}
        onMouseLeave={handleWordLeave}
        tabIndex={0}
        aria-label={`${word}, 读音: ${furigana}`}
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

  const renderNote = (noteText, noteData, noteIndex, position) => {
    if (!showNotes) {
      return <span key={`n-${noteIndex}`} className={styles.plainText}>{noteText}</span>;
    }

    const noteKey = `${noteText}_${position}`;
    const noteContent = typeof noteData === 'string' ? noteData : noteData?.content;
    const noteType = typeof noteData === 'object' ? noteData?.type : 'vocabulary';
    const noteId = `note-${sentenceIndex}-${noteIndex}`;
    const isActive = activeNoteIndex === noteId;

    const getTypeIcon = (t) => {
      const icons = { vocabulary: '📚', grammar: '📝', cultural: '🏮', pronunciation: '🔊' };
      return icons[t] || '💡';
    };

    return (
      <span
        key={`n-${noteIndex}`}
        className={`${styles.noteHighlight} ${styles[`noteType-${noteType}`] || ''}`}
        onClick={(e) => toggleNote(noteId, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggleNote(noteId, e);
        }}
        ref={(el) => registerNoteRef?.(sentenceIndex, noteKey, el)}
        role="button"
        tabIndex={0}
        aria-label={`${noteText}: ${noteContent}`}
        data-note-key={noteKey}
        style={{ position: 'relative' }}
      >
        {noteText}

        {isActive && (
          <div className={styles.inlineNotePanel}>
            <div className={styles.notePanelArrow} />
            <div className={styles.notePanelContent}>
              <div className={styles.notePanelHeader}>
                <span className={styles.noteTypeIcon}>{getTypeIcon(noteType)}</span>
                <strong>{noteText}</strong>
                <button
                  className={styles.closeNoteButton}
                  onClick={(e) => toggleNote(noteId, e)}
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

  // Fallback rendering when segments aren't available
  const renderFallback = () => {
    if (!annotation || Object.keys(annotation).length === 0) {
      const noteKeys = Object.keys(notes);
      if (noteKeys.length === 0) {
        return <span className={styles.plainText}>{text}</span>;
      }

      let result = [];
      let currentIndex = 0;
      noteKeys.forEach((noteKey, index) => {
        const noteText = noteKey.includes('_') ? noteKey.split('_')[0] : noteKey;
        const noteIndex = text.indexOf(noteText, currentIndex);
        if (noteIndex !== -1) {
          if (noteIndex > currentIndex) {
            result.push(<span key={`t-${index}`} className={styles.plainText}>{text.substring(currentIndex, noteIndex)}</span>);
          }
          result.push(renderNote(noteText, notes[noteKey], index, noteIndex));
          currentIndex = noteIndex + noteText.length;
        }
      });
      if (currentIndex < text.length) {
        result.push(<span key="end" className={styles.plainText}>{text.substring(currentIndex)}</span>);
      }
      return result;
    }

    let result = [];
    let currentIndex = 0;
    let wordIndex = 0;
    Object.keys(annotation).forEach((word) => {
      const index = text.indexOf(word, currentIndex);
      if (index !== -1) {
        if (index > currentIndex) {
          result.push(<span key={`p-${index}`} className={styles.plainText}>{text.substring(currentIndex, index)}</span>);
        }
        result.push(renderAnnotated(word, annotation[word], wordIndex));
        currentIndex = index + word.length;
        wordIndex++;
      }
    });
    if (currentIndex < text.length) {
      result.push(<span key="end" className={styles.plainText}>{text.substring(currentIndex)}</span>);
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