import React, { memo } from 'react';
import styles from './ControlPanel.module.css';

/**
 * Minimal pill-style toolbar for display preferences
 */
const ControlPanel = memo(({
  preferences,
  onPreferenceChange,
  className = ''
}) => {
  const handleToggle = (section, field) => () => {
    const current = preferences[section]?.[field] ?? false;
    onPreferenceChange(section, field, !current);
  };

  const renderItem = (section, field, label, shortcut) => {
    const isChecked = preferences[section]?.[field] ?? false;

    return (
      <div className={styles.toggleContainer} key={`${section}-${field}`}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleToggle(section, field)}
            className={styles.toggleInput}
            aria-label={`${label} ${isChecked ? '已启用' : '已禁用'}`}
          />
          <span className={styles.toggleSlider} aria-hidden="true" />
          <span className={styles.toggleText}>
            {label}
            {shortcut && (
              <span className={styles.shortcutHint} aria-hidden="true">
                {shortcut}
              </span>
            )}
          </span>
        </label>
      </div>
    );
  };

  return (
    <div className={`${styles.controlPanel} ${className}`} role="toolbar" aria-label="显示控制">
      <div className={styles.mainControls}>
        {renderItem('display', 'showFurigana', '注音', 'F')}
        {renderItem('display', 'showTranslation', '翻译', 'T')}
        {renderItem('display', 'showNotes', '笔记', 'N')}
        {renderItem('display', 'showLineNumbers', '行号', 'L')}
      </div>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;