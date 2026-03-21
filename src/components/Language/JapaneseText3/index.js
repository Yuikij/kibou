import React, { useRef, useMemo, useCallback } from 'react';
import { ControlPanel, TextBlock, ErrorBoundary } from './components';
import { useTextParsing, useNoteHandling, useLocalStorage } from './hooks';
import { DEFAULT_PREFERENCES } from './utils/constants';
import { validateProps, createErrorMessage } from './utils/validation';
import './styles/index.css';
import styles from './JapaneseText.module.css';

/**
 * JapaneseText — a clean, elegant Japanese text display component
 * with furigana, translations, and inline notes.
 */
const JapaneseText = React.memo(({
  texts,
  translations,
  annotations,
  fullText,
  notes,
  initialPreferences,
  onPreferenceChange,
  onError,
  className = '',
  ...props
}) => {
  const containerRef = useRef(null);

  // Validate props
  const validationResult = validateProps({
    texts, translations, annotations, fullText, notes, initialPreferences
  });

  if (!validationResult.isValid) {
    const errorMessage = createErrorMessage(validationResult);
    if (process.env.NODE_ENV === 'development') {
      console.error('JapaneseText validation failed:', validationResult.errors);
    }
    if (onError) {
      onError(new Error(errorMessage), { validationResult });
    }
    return (
      <div className={`${styles.container} ${className}`} role="alert">
        <div className={styles.errorMessage}>
          <h3>数据验证失败</h3>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Parse text data
  const { data: textData, isLoading, error: parseError, isEmpty } = useTextParsing({
    texts, translations, annotations, fullText, notes
  });

  if (parseError) {
    if (onError) {
      onError(new Error(parseError), { parseError });
    }
    return (
      <div className={`${styles.container} ${className}`} role="alert">
        <div className={styles.errorMessage}>
          <h3>文本解析失败</h3>
          <p>{parseError}</p>
        </div>
      </div>
    );
  }

  // User preferences
  const {
    preferences,
    updatePreference,
    resetToDefaults
  } = useLocalStorage('japaneseTextPrefs', {
    ...DEFAULT_PREFERENCES,
    ...initialPreferences
  });

  // Note handling
  const noteHandling = useNoteHandling(textData?.processed || [], preferences);

  // Handle preference changes
  const handlePreferenceChange = useCallback((section, field, value) => {
    updatePreference(section, field, value);
    if (onPreferenceChange) {
      onPreferenceChange({ [section]: { [field]: value } });
    }
  }, [updatePreference, onPreferenceChange]);

  if (isLoading) {
    return (
      <div className={`${styles.container} ${styles.loading} ${className}`}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`${styles.container} ${styles.empty} ${className}`}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>テキストがありません</h3>
          <p>表示する日本語テキストを提供してください。</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      {...props}
    >
      <ControlPanel
        preferences={preferences}
        onPreferenceChange={handlePreferenceChange}
        className={styles.controlPanel}
      />

      <main className={styles.content}>
        {(textData?.processed || []).map((textBlockData, index) => (
          <TextBlock
            key={index}
            textData={textBlockData}
            index={index}
            preferences={preferences}
            registerNoteRef={noteHandling.registerNoteRef}
          />
        ))}
      </main>
    </div>
  );
});

JapaneseText.displayName = 'JapaneseText';

// Wrap with error boundary
const JapaneseTextWithErrorBoundary = React.memo((props) => (
  <ErrorBoundary
    onError={props.onError}
    showDetails={process.env.NODE_ENV === 'development'}
  >
    <JapaneseText {...props} />
  </ErrorBoundary>
));

JapaneseTextWithErrorBoundary.displayName = 'JapaneseText';

export default JapaneseTextWithErrorBoundary;