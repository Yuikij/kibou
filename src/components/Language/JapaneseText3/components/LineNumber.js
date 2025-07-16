import React, { memo } from 'react';
import { generateAriaLabels } from '../utils/accessibility';
import styles from './LineNumber.module.css';

/**
 * Line number component with sticky positioning and hover effects
 */
const LineNumber = memo(({ 
  number,
  isHovered = false,
  onClick,
  className = ''
}) => {
  const ariaLabel = generateAriaLabels.lineNumber(number);
  const formattedNumber = String(number).padStart(2, '0');

  const handleClick = () => {
    if (onClick) {
      onClick(number);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      event.preventDefault();
      onClick(number);
    }
  };

  return (
    <div 
      className={`
        ${styles.lineNumberArea} 
        ${isHovered ? styles.hovered : ''}
        ${onClick ? styles.clickable : ''}
        ${className}
      `}
    >
      <div
        className={styles.lineNumber}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `${ariaLabel}, 点击跳转` : ariaLabel}
        data-line-number={number}
      >
        {formattedNumber}
      </div>
    </div>
  );
});

LineNumber.displayName = 'LineNumber';

export default LineNumber;