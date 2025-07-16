// Accessibility helper functions for JapaneseText2 component

/**
 * Generates ARIA labels for different component elements
 */
export const generateAriaLabels = {
  /**
   * Creates ARIA label for annotated text with furigana
   * @param {string} kanji - The kanji text
   * @param {string} furigana - The furigana reading
   * @returns {string} ARIA label
   */
  annotatedText: (kanji, furigana) => {
    return `${kanji}, 读音: ${furigana}`;
  },

  /**
   * Creates ARIA label for note highlights
   * @param {string} text - The highlighted text
   * @param {string} noteContent - The note content
   * @returns {string} ARIA label
   */
  noteHighlight: (text, noteContent) => {
    const preview = noteContent.length > 50 
      ? `${noteContent.substring(0, 50)}...` 
      : noteContent;
    return `${text}, 笔记: ${preview}`;
  },

  /**
   * Creates ARIA label for control toggles
   * @param {string} feature - The feature name
   * @param {boolean} isEnabled - Whether the feature is enabled
   * @returns {string} ARIA label
   */
  toggle: (feature, isEnabled) => {
    const status = isEnabled ? '已启用' : '已禁用';
    return `${feature} ${status}`;
  },

  /**
   * Creates ARIA label for line numbers
   * @param {number} lineNumber - The line number
   * @returns {string} ARIA label
   */
  lineNumber: (lineNumber) => {
    return `第 ${lineNumber} 行`;
  },

  /**
   * Creates ARIA label for text blocks
   * @param {number} index - Block index
   * @param {string} text - Block text preview
   * @returns {string} ARIA label
   */
  textBlock: (index, text) => {
    const preview = text.length > 30 
      ? `${text.substring(0, 30)}...` 
      : text;
    return `文本块 ${index + 1}: ${preview}`;
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Gets all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {NodeList} Focusable elements
   */
  getFocusableElements: (container) => {
    return container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  },

  /**
   * Traps focus within a container (for modals)
   * @param {HTMLElement} container - Container element
   * @param {KeyboardEvent} event - Keyboard event
   */
  trapFocus: (container, event) => {
    const focusableElements = keyboardNavigation.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  },

  /**
   * Handles arrow key navigation for note elements
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Array} noteElements - Array of note elements
   * @param {number} currentIndex - Current focused index
   * @returns {number} New focused index
   */
  handleArrowNavigation: (event, noteElements, currentIndex) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, noteElements.length - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = noteElements.length - 1;
        break;
      default:
        return currentIndex;
    }
    
    if (newIndex !== currentIndex) {
      noteElements[newIndex]?.focus();
      event.preventDefault();
    }
    
    return newIndex;
  }
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announces content to screen readers using live regions
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  announce: (message, priority = 'polite') => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  },

  /**
   * Creates description for complex UI elements
   * @param {Object} element - Element data
   * @returns {string} Description
   */
  describeElement: (element) => {
    const { type, text, hasNotes, hasFurigana, translation } = element;
    
    let description = `${type}: ${text}`;
    
    if (hasFurigana) {
      description += ', 包含注音';
    }
    
    if (hasNotes) {
      description += ', 包含笔记';
    }
    
    if (translation) {
      description += `, 翻译: ${translation}`;
    }
    
    return description;
  }
};

/**
 * High contrast and visual accessibility utilities
 */
export const visualAccessibility = {
  /**
   * Checks if user prefers reduced motion
   * @returns {boolean} True if reduced motion is preferred
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Checks if user prefers high contrast
   * @returns {boolean} True if high contrast is preferred
   */
  prefersHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Calculates color contrast ratio
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  getContrastRatio: (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Checks if color combination meets WCAG AA standards
   * @param {string} foreground - Foreground color
   * @param {string} background - Background color
   * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
   * @returns {boolean} True if meets standards
   */
  meetsWCAGAA: (foreground, background, isLargeText = false) => {
    const ratio = visualAccessibility.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Saves current focus and returns a restore function
   * @returns {Function} Function to restore focus
   */
  saveFocus: () => {
    const activeElement = document.activeElement;
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus();
      }
    };
  },

  /**
   * Sets focus to first focusable element in container
   * @param {HTMLElement} container - Container element
   */
  focusFirst: (container) => {
    const focusableElements = keyboardNavigation.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  /**
   * Creates visible focus indicator styles
   * @param {string} color - Focus color
   * @returns {Object} CSS styles object
   */
  createFocusStyles: (color = '#0066cc') => ({
    outline: `2px solid ${color}`,
    outlineOffset: '2px',
    borderRadius: '2px'
  })
};