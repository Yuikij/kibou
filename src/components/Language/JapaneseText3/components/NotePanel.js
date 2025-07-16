import React, { memo, useEffect, useRef } from 'react';
import { focusManagement } from '../utils/accessibility';
import styles from './NotePanel.module.css';

/**
 * Floating note panel component with mobile-optimized modal version
 */
const NotePanel = memo(({ 
  note,
  position,
  isMobile = false,
  onClose,
  onNavigate,
  className = ''
}) => {
  const panelRef = useRef(null);
  const restoreFocus = useRef(null);

  // Save focus when panel opens
  useEffect(() => {
    if (note) {
      restoreFocus.current = focusManagement.saveFocus();
      
      // Focus the panel for keyboard navigation
      setTimeout(() => {
        if (panelRef.current) {
          focusManagement.focusFirst(panelRef.current);
        }
      }, 100);
    }
    
    return () => {
      // Restore focus when panel closes
      if (restoreFocus.current) {
        restoreFocus.current();
      }
    };
  }, [note]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!note) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          if (onNavigate) {
            event.preventDefault();
            onNavigate('next');
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (onNavigate) {
            event.preventDefault();
            onNavigate('prev');
          }
          break;
        default:
          break;
      }
    };

    if (note) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [note, onClose, onNavigate]);

  if (!note) return null;

  const { text, content, type = 'vocabulary', difficulty = 'intermediate', tags = [] } = note;

  const panelStyle = isMobile 
    ? {} 
    : {
        top: position.top,
        left: position.left,
        transform: position.centered ? 'translate(-50%, -50%)' : undefined
      };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (noteType) => {
    switch (noteType) {
      case 'vocabulary': return '📚';
      case 'grammar': return '📝';
      case 'cultural': return '🏮';
      case 'pronunciation': return '🔊';
      default: return '💡';
    }
  };

  return (
    <>
      {/* Overlay for mobile or backdrop */}
      <div 
        className={`${styles.overlay} ${isMobile ? styles.mobileOverlay : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Note panel */}
      <div
        ref={panelRef}
        className={`
          ${styles.notePanel} 
          ${isMobile ? styles.mobilePanel : styles.desktopPanel}
          ${styles[`type-${type}`] || ''}
          ${className}
        `}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
        aria-describedby="note-content"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.typeIcon} aria-hidden="true">
              {getTypeIcon(type)}
            </span>
            <h3 id="note-title" className={styles.title}>
              {text}
            </h3>
            <span 
              className={styles.difficulty}
              style={{ backgroundColor: getDifficultyColor(difficulty) }}
              title={`难度: ${difficulty}`}
            >
              {difficulty}
            </span>
          </div>
          
          <div className={styles.controls}>
            {onNavigate && (
              <>
                <button
                  className={styles.navButton}
                  onClick={() => onNavigate('prev')}
                  aria-label="上一个笔记"
                  title="上一个笔记 (←)"
                >
                  ←
                </button>
                <button
                  className={styles.navButton}
                  onClick={() => onNavigate('next')}
                  aria-label="下一个笔记"
                  title="下一个笔记 (→)"
                >
                  →
                </button>
              </>
            )}
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="关闭笔记"
              title="关闭 (Esc)"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.body}>
          <div id="note-content" className={styles.content}>
            {content}
          </div>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer with metadata */}
        <div className={styles.footer}>
          <div className={styles.metadata}>
            <span className={styles.metadataItem}>
              类型: {type}
            </span>
            <span className={styles.metadataItem}>
              难度: {difficulty}
            </span>
          </div>
          
          {!isMobile && (
            <div className={styles.shortcuts}>
              <span className={styles.shortcut}>
                <kbd>←/→</kbd> 导航
              </span>
              <span className={styles.shortcut}>
                <kbd>Esc</kbd> 关闭
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

NotePanel.displayName = 'NotePanel';

export default NotePanel;