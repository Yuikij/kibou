import React, { memo } from 'react';
import { generateAriaLabels } from '../utils/accessibility';
import styles from './ControlPanel.module.css';

/**
 * Control panel component for display preferences
 */
const ControlPanel = memo(({ 
  preferences, 
  onPreferenceChange, 
  shortcuts = [],
  className = '' 
}) => {
  const handleToggleChange = (section, field) => (event) => {
    onPreferenceChange(section, field, event.target.checked);
  };



  const renderToggle = (section, field, label, shortcut = null) => {
    const isChecked = preferences[section]?.[field] ?? false;
    const ariaLabel = generateAriaLabels.toggle(label, isChecked);
    
    return (
      <div className={styles.toggleContainer} key={`${section}-${field}`}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleToggleChange(section, field)}
            className={styles.toggleInput}
            aria-label={ariaLabel}
          />
          <span className={styles.toggleSlider} aria-hidden="true"></span>
          <span className={styles.toggleText}>
            {label}
            {shortcut && (
              <span className={styles.shortcutHint} aria-label={`快捷键: ${shortcut}`}>
                {shortcut}
              </span>
            )}
          </span>
        </label>
      </div>
    );
  };



  return (
    <div className={`${styles.controlPanel} ${className}`} role="toolbar" aria-label="显示控制面板">
      {/* 简化控制面板 - 只保留4个基本功能 */}
      <div className={styles.mainControls}>
        {renderToggle('display', 'showFurigana', '注音', 'F')}
        {renderToggle('display', 'showTranslation', '翻译', 'T')}
        {renderToggle('display', 'showNotes', '笔记', 'N')}
        {renderToggle('display', 'showLineNumbers', '行号', 'L')}
      </div>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;