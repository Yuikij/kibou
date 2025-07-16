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

  const handleSelectChange = (section, field) => (event) => {
    onPreferenceChange(section, field, event.target.value);
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

  const renderSelect = (section, field, label, options) => {
    const currentValue = preferences[section]?.[field] ?? options[0].value;
    
    return (
      <div className={styles.selectContainer} key={`${section}-${field}`}>
        <label className={styles.selectLabel}>
          <span className={styles.selectText}>{label}</span>
          <select
            value={currentValue}
            onChange={handleSelectChange(section, field)}
            className={styles.select}
            aria-label={`选择${label}`}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };

  return (
    <div className={`${styles.controlPanel} ${className}`} role="toolbar" aria-label="显示控制面板">
      {/* 主要控制选项 - 紧凑单行显示 */}
      <div className={styles.mainControls}>
        {renderToggle('display', 'showFurigana', '注音', 'F')}
        {renderToggle('display', 'showTranslation', '翻译', 'T')}
        {renderToggle('display', 'showNotes', '笔记', 'N')}
        
        {/* 字体大小快速调节 */}
        <div className={styles.fontSizeControls}>
          <span className={styles.controlLabel}>字体</span>
          {renderSelect('typography', 'fontSize', '', [
            { value: 'small', label: '小' },
            { value: 'medium', label: '中' },
            { value: 'large', label: '大' }
          ])}
        </div>
      </div>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;