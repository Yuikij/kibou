import { useEffect, useCallback, useRef } from 'react';
import { KEYBOARD_SHORTCUTS } from '../utils/constants';

/**
 * Custom hook for keyboard shortcut handling
 * @param {Object} preferences - User preferences
 * @param {Function} onPreferenceChange - Callback for preference changes
 * @param {Object} noteHandling - Note handling functions
 * @returns {Object} Keyboard shortcut utilities
 */
export const useKeyboardShortcuts = (preferences, onPreferenceChange, noteHandling) => {
  const shortcutsEnabled = preferences?.interaction?.keyboardShortcuts !== false;
  const activeShortcuts = useRef(new Set());

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    if (!shortcutsEnabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return;
    }

    // Handle modifier keys
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;

    // Create shortcut key combination
    const shortcutKey = `${hasCtrl ? 'Ctrl+' : ''}${hasShift ? 'Shift+' : ''}${hasAlt ? 'Alt+' : ''}${event.code}`;

    // Handle shortcuts
    switch (event.code) {
      case KEYBOARD_SHORTCUTS.TOGGLE_FURIGANA:
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onPreferenceChange('showFurigana', !preferences.display.showFurigana);
        }
        break;

      case KEYBOARD_SHORTCUTS.TOGGLE_TRANSLATION:
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onPreferenceChange('showTranslation', !preferences.display.showTranslation);
        }
        break;

      case KEYBOARD_SHORTCUTS.TOGGLE_NOTES:
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onPreferenceChange('showNotes', !preferences.display.showNotes);
        }
        break;

      case KEYBOARD_SHORTCUTS.TOGGLE_LINE_NUMBERS:
        if (!hasCtrl && !hasShift && !hasAlt) {
          event.preventDefault();
          onPreferenceChange('showLineNumbers', !preferences.display.showLineNumbers);
        }
        break;

      case KEYBOARD_SHORTCUTS.CLOSE_NOTE:
        if (noteHandling?.activeNote) {
          event.preventDefault();
          noteHandling.closeNote();
        }
        break;

      case KEYBOARD_SHORTCUTS.NEXT_NOTE:
        if (noteHandling?.activeNote) {
          event.preventDefault();
          noteHandling.navigateNote('next');
        }
        break;

      case KEYBOARD_SHORTCUTS.PREV_NOTE:
        if (noteHandling?.activeNote) {
          event.preventDefault();
          noteHandling.navigateNote('prev');
        }
        break;

      case KEYBOARD_SHORTCUTS.INCREASE_FONT:
        if (hasCtrl) {
          event.preventDefault();
          const currentSize = preferences.typography.fontSize;
          const sizes = ['small', 'medium', 'large'];
          const currentIndex = sizes.indexOf(currentSize);
          if (currentIndex < sizes.length - 1) {
            onPreferenceChange('fontSize', sizes[currentIndex + 1]);
          }
        }
        break;

      case KEYBOARD_SHORTCUTS.DECREASE_FONT:
        if (hasCtrl) {
          event.preventDefault();
          const currentSize = preferences.typography.fontSize;
          const sizes = ['small', 'medium', 'large'];
          const currentIndex = sizes.indexOf(currentSize);
          if (currentIndex > 0) {
            onPreferenceChange('fontSize', sizes[currentIndex - 1]);
          }
        }
        break;

      default:
        break;
    }

    // Track active shortcuts for help display
    activeShortcuts.current.add(shortcutKey);
  }, [shortcutsEnabled, preferences, onPreferenceChange, noteHandling]);

  // Handle key up to remove from active shortcuts
  const handleKeyUp = useCallback((event) => {
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;
    const shortcutKey = `${hasCtrl ? 'Ctrl+' : ''}${hasShift ? 'Shift+' : ''}${hasAlt ? 'Alt+' : ''}${event.code}`;
    
    activeShortcuts.current.delete(shortcutKey);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (shortcutsEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [shortcutsEnabled, handleKeyDown, handleKeyUp]);

  // Get shortcut descriptions for help
  const getShortcutDescriptions = useCallback(() => {
    return [
      {
        key: 'F',
        description: '切换注音显示',
        category: '显示控制'
      },
      {
        key: 'T',
        description: '切换翻译显示',
        category: '显示控制'
      },
      {
        key: 'N',
        description: '切换笔记显示',
        category: '显示控制'
      },
      {
        key: 'L',
        description: '切换行号显示',
        category: '显示控制'
      },
      {
        key: 'Escape',
        description: '关闭笔记面板',
        category: '笔记导航'
      },
      {
        key: '→ / ↓',
        description: '下一个笔记',
        category: '笔记导航'
      },
      {
        key: '← / ↑',
        description: '上一个笔记',
        category: '笔记导航'
      },
      {
        key: 'Ctrl + +',
        description: '增大字体',
        category: '字体控制'
      },
      {
        key: 'Ctrl + -',
        description: '减小字体',
        category: '字体控制'
      }
    ];
  }, []);

  // Check if a specific shortcut is available
  const isShortcutAvailable = useCallback((shortcutCode) => {
    return shortcutsEnabled && Object.values(KEYBOARD_SHORTCUTS).includes(shortcutCode);
  }, [shortcutsEnabled]);

  // Get current shortcut status
  const getShortcutStatus = useCallback(() => {
    return {
      enabled: shortcutsEnabled,
      activeShortcuts: Array.from(activeShortcuts.current),
      availableShortcuts: Object.keys(KEYBOARD_SHORTCUTS).length
    };
  }, [shortcutsEnabled]);

  return {
    shortcutsEnabled,
    getShortcutDescriptions,
    isShortcutAvailable,
    getShortcutStatus,
    activeShortcuts: activeShortcuts.current
  };
};