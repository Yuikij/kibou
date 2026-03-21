import React from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Error boundary for graceful error handling
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JapaneseText Error:', error, errorInfo);
    }
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const { showDetails = false } = this.props;

      return (
        <div className={styles.errorBoundary} role="alert">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.errorContent}>
              <h2 className={styles.errorTitle}>出现了一个错误</h2>
              <p className={styles.errorMessage}>
                日文文本组件遇到了意外错误。
              </p>

              {showDetails && error && (
                <details className={styles.errorDetails}>
                  <summary className={styles.errorDetailsSummary}>
                    错误详情
                  </summary>
                  <div className={styles.errorDetailsContent}>
                    <p><strong>错误信息:</strong> {error.message}</p>
                    {process.env.NODE_ENV === 'development' && (
                      <pre className={styles.errorStack}>{error.stack}</pre>
                    )}
                  </div>
                </details>
              )}

              <div className={styles.errorActions}>
                <button
                  className={styles.retryButton}
                  onClick={this.handleRetry}
                  type="button"
                >
                  重试
                </button>
                <button
                  className={styles.reloadButton}
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;