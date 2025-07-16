import React from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Error boundary component for graceful error handling
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('JapaneseText2 Error Boundary caught an error:', error, errorInfo);
    }

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production' && this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('错误报告已复制到剪贴板');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(errorReport, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('错误报告已复制到剪贴板');
      });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const { fallback: CustomFallback, showDetails = false } = this.props;

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorId={errorId}
            onRetry={this.handleRetry}
            onReport={this.handleReportError}
          />
        );
      }

      // Default error UI
      return (
        <div className={styles.errorBoundary} role="alert">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              ⚠️
            </div>
            
            <div className={styles.errorContent}>
              <h2 className={styles.errorTitle}>
                出现了一个错误
              </h2>
              
              <p className={styles.errorMessage}>
                很抱歉，日文文本组件遇到了一个意外错误。请尝试刷新页面或联系技术支持。
              </p>

              {showDetails && error && (
                <details className={styles.errorDetails}>
                  <summary className={styles.errorDetailsSummary}>
                    错误详情
                  </summary>
                  <div className={styles.errorDetailsContent}>
                    <p><strong>错误ID:</strong> {errorId}</p>
                    <p><strong>错误信息:</strong> {error.message}</p>
                    {process.env.NODE_ENV === 'development' && (
                      <pre className={styles.errorStack}>
                        {error.stack}
                      </pre>
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
                  className={styles.reportButton}
                  onClick={this.handleReportError}
                  type="button"
                >
                  复制错误报告
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