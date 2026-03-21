import React, { memo } from 'react';
import AnnotatedText from './AnnotatedText';
import LineNumber from './LineNumber';
import styles from './TextBlock.module.css';

/**
 * Individual text block — one sentence with optional translation
 */
const TextBlock = memo(({
  textData,
  index,
  preferences,
  registerNoteRef,
  className = ''
}) => {
  const {
    text,
    translation,
    annotation,
    notes,
    segments
  } = textData;

  const showLineNumbers = preferences.display?.showLineNumbers ?? false;
  const showTranslation = preferences.display?.showTranslation ?? true;

  return (
    <div
      className={`${styles.textBlock} ${className}`}
      data-text-index={index}
    >
      <div className={styles.lineContainer}>
        {showLineNumbers && (
          <LineNumber
            number={index + 1}
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
              registerNoteRef={registerNoteRef}
            />
          </div>

          {translation && showTranslation && (
            <div className={styles.translationSection}>
              <div className={styles.translationText}>
                {translation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TextBlock.displayName = 'TextBlock';

export default TextBlock;