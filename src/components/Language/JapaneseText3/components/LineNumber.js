import React, { memo } from 'react';
import styles from './LineNumber.module.css';

/**
 * Simple line number display
 */
const LineNumber = memo(({ number, className = '' }) => {
  const formatted = String(number).padStart(2, '0');

  return (
    <div className={`${styles.lineNumberArea} ${className}`}>
      <span className={styles.lineNumber} aria-label={`第 ${number} 行`}>
        {formatted}
      </span>
    </div>
  );
});

LineNumber.displayName = 'LineNumber';

export default LineNumber;