import React, { useRef, useEffect } from 'react';
import {
  ControlPanel,
  TextBlock,
  NotePanel,
  ErrorBoundary
} from './components';
import {
  useTextParsing,
  useNoteHandling,
  useKeyboardShortcuts,
  useLocalStorage
} from './hooks';
import {
  useAccessibilityManager,
  usePerformanceMonitor,
  validateProps,
  createErrorMessage,
  DEFAULT_PREFERENCES
} from './utils';
import './styles/index.css';
import styles from './JapaneseText2.module.css';

/**
 * Enhanced JapaneseText2 component with improved architecture
 */
const JapaneseText2 = React.memo(({
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

  // Performance monitoring
  const { getPerformanceStats } = usePerformanceMonitor('JapaneseText2');

  // Validate props
  const validationResult = validateProps({
    texts,
    translations,
    annotations,
    fullText,
    notes,
    initialPreferences
  });

  // Handle validation errors
  if (!validationResult.isValid) {
    const errorMessage = createErrorMessage(validationResult);
    console.error('JapaneseText2 validation failed:', validationResult.errors);

    if (onError) {
      onError(new Error(errorMessage), { validationResult });
    }

    return (
      <div className={`${styles.container} ${className}`} role="alert">
        <div className={styles.errorMessage}>
          <h3>数据验证失败</h3>
          <p>{errorMessage}</p>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>详细错误信息</summary>
              <pre>{JSON.stringify(validationResult.errors, null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Parse text data
  const { data: textData, isLoading, error: parseError, isEmpty } = useTextParsing({
    texts,
    translations,
    annotations,
    fullText,
    notes
  });

  // Handle parsing errors
  if (parseError) {
    const errorMessage = `文本解析失败: ${parseError}`;
    console.error('JapaneseText2 parsing failed:', parseError);

    if (onError) {
      onError(new Error(errorMessage), { parseError });
    }

    return (
      <div className={`${styles.container} ${className}`} role="alert">
        <div className={styles.errorMessage}>
          <h3>文本解析失败</h3>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  // User preferences management
  const {
    preferences,
    updatePreference,
    exportPreferences,
    importPreferences,
    resetToDefaults
  } = useLocalStorage('japaneseText2Preferences', {
    ...DEFAULT_PREFERENCES,
    ...initialPreferences
  });

  // Note handling
  const noteHandling = useNoteHandling(textData?.processed || []);

  // Keyboard shortcuts
  const keyboardShortcuts = useKeyboardShortcuts(
    preferences,
    (section, field, value) => {
      updatePreference(section, field, value);
      if (onPreferenceChange) {
        onPreferenceChange({ [section]: { [field]: value } });
      }
    },
    noteHandling
  );

  // Accessibility management
  const accessibilityManager = useAccessibilityManager(containerRef, {
    announceChanges: true,
    keyboardNavigation: preferences.interaction?.keyboardShortcuts !== false,
    screenReaderOptimized: preferences.accessibility?.screenReaderOptimized || false
  });

  // Handle preference changes
  const handlePreferenceChange = (section, field, value) => {
    updatePreference(section, field, value);

    // Announce changes to screen readers
    if (accessibilityManager) {
      accessibilityManager.announcePreferenceChange(field, value);
    }

    // Notify parent component
    if (onPreferenceChange) {
      onPreferenceChange({ [section]: { [field]: value } });
    }
  };

  // Handle note interactions
  const handleNoteClick = (noteKey, noteContent, event, sentenceIndex) => {
    noteHandling.handleNoteClick(noteKey, noteContent, event, sentenceIndex);

    // Announce to screen readers
    if (accessibilityManager) {
      const displayText = noteKey.includes('_') ? noteKey.split('_')[0] : noteKey;
      const content = typeof noteContent === 'string' ? noteContent : noteContent.content;
      accessibilityManager.announceNoteOpened(displayText, content);
    }
  };

  const handleNoteClose = () => {
    noteHandling.closeNote();

    // Announce to screen readers
    if (accessibilityManager) {
      accessibilityManager.announceNoteClosed();
    }
  };

  // Log performance stats in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stats = getPerformanceStats();
      if (stats.renderCount % 10 === 0) {
        console.log('JapaneseText2 Performance Stats:', stats);
      }
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${styles.container} ${styles.loading} ${className}`}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <p>正在加载文本...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <div className={`${styles.container} ${styles.empty} ${className}`}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>没有文本内容</h3>
          <p>请提供要显示的日文文本。</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className} japaneseText2`}
      data-font-size={preferences.typography?.fontSize}
      data-line-spacing={preferences.typography?.lineSpacing}
      data-theme={preferences.theme}
      {...props}
    >
      {/* Control Panel */}
      <ControlPanel
        preferences={preferences}
        onPreferenceChange={handlePreferenceChange}
        shortcuts={keyboardShortcuts.getShortcutDescriptions()}
        className={styles.controlPanel}
      />

      {/* Main Content */}
      <main className={styles.content} id="jt2-main-content">
        {textData.processed.map((textBlockData, index) => (
          <TextBlock
            key={index}
            textData={textBlockData}
            index={index}
            preferences={preferences}
            onNoteClick={handleNoteClick}
            registerNoteRef={noteHandling.registerNoteRef}
            className={styles.textBlock}
          />
        ))}
      </main>

      {/* Note Panel */}
      <NotePanel
        note={noteHandling.activeNote}
        position={noteHandling.notePosition}
        isMobile={noteHandling.isMobile}
        onClose={handleNoteClose}
        onNavigate={noteHandling.navigateNote}
      />

      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.devTools}>
          <details>
            <summary>开发工具</summary>
            <div className={styles.devToolsContent}>
              <h4>统计信息</h4>
              <p>文本块数量: {textData.processed.length}</p>
              <p>总字符数: {textData.statistics?.totalCharacters || 0}</p>
              <p>包含注音: {textData.statistics?.textsWithAnnotations || 0}</p>
              <p>包含笔记: {textData.statistics?.textsWithNotes || 0}</p>
              <p>包含翻译: {textData.statistics?.textsWithTranslations || 0}</p>

              <h4>偏好设置</h4>
              <button onClick={() => console.log('Preferences:', preferences)}>
                打印偏好设置
              </button>
              <button onClick={() => console.log('Performance:', getPerformanceStats())}>
                打印性能统计
              </button>
              <button onClick={resetToDefaults}>
                重置为默认设置
              </button>
            </div>
          </details>
        </div>
      )}
    </div>
  );
});

JapaneseText2.displayName = 'JapaneseText2';

// Wrap with error boundary
const JapaneseText2WithErrorBoundary = React.memo((props) => (
  <ErrorBoundary
    onError={props.onError}
    showDetails={process.env.NODE_ENV === 'development'}
  >
    <JapaneseText2 {...props} />
  </ErrorBoundary>
));

JapaneseText2WithErrorBoundary.displayName = 'JapaneseText2WithErrorBoundary';

export default JapaneseText2WithErrorBoundary;