import React, { memo, useState } from 'react';
import AnnotatedText from './AnnotatedText';
import LineNumber from './LineNumber';
import { generateAriaLabels } from '../utils/accessibility';
import styles from './TextBlock.module.css';

/**
 * Individual text block component with hover effects and responsive layout
 */
const TextBlock = memo(({ 
  textData,
  index,
  preferences,
  onNoteClick,
  registerNoteRef,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    text,
    translation,
    annotation,
    notes,
    segments,
    hasAnnotations,
    hasNotes,
    hasTranslation
  } = textData;

  const showLineNumbers = preferences.display?.showLineNumbers ?? false;
  const showTranslation = preferences.display?.showTranslation ?? true;
  const compactMode = preferences.display?.compactMode ?? false;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const blockAriaLabel = generateAriaLabels.textBlock(index, text);

  return (
    <div 
      className={`
        ${styles.textBlock} 
        ${isHovered ? styles.textBlockHovered : ''} 
        ${compactMode ? styles.compactMode : ''}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={blockAriaLabel}
      data-text-index={index}
    >
      <div className={styles.lineContainer}>
        {showLineNumbers && (
          <LineNumber 
            number={index + 1}
            isHovered={isHovered}
            className={styles.lineNumberArea}
          />
        )}
        
        <div className={styles.lineContent}>
          <div className={styles.japaneseSection}>
            <AnnotatedText
              text={text}
              segments={segments}
              annotation={annotation}
              notes={notes}
              sentenceIndex={index}
              preferences={preferences}
              onNoteClick={onNoteClick}
              registerNoteRef={registerNoteRef}
            />
          </div>
          
          {translation && showTranslation && (
            <div className={styles.translationSection}>
              <div 
                className={styles.translationText}
                role="complementary"
                aria-label={`翻译: ${translation}`}
              >
                {translation}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Metadata indicators */}
      <div className={styles.metadata} aria-hidden="true">
        {hasAnnotations && (
          <span className={styles.metadataIcon} title="包含注音">
            あ
          </span>
        )}
        {hasNotes && (
          <span className={styles.metadataIcon} title="包含笔记">
            📝
          </span>
        )}
        {hasTranslation && (
          <span className={styles.metadataIcon} title="包含翻译">
            🌐
          </span>
        )}
      </div>
    </div>
  );
});

TextBlock.displayName = 'TextBlock';

export default TextBlock;