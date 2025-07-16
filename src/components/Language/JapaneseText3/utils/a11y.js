// Enhanced accessibility utilities for JapaneseText2 component

import { useState, useEffect } from 'react';
import { generateAriaLabels, keyboardNavigation, screenReader, visualAccessibility, focusManagement } from './accessibility';

/**
 * Comprehensive accessibility manager for JapaneseText2
 */
export class AccessibilityManager {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = {
      announceChanges: true,
      keyboardNavigation: true,
      focusManagement: true,
      screenReaderOptimized: false,
      ...options
    };
    
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupHighContrastSupport();
    this.setupReducedMotionSupport();
  }

  setupKeyboardNavigation() {
    if (!this.options.keyboardNavigation) return;

    // Add keyboard event listeners
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Ensure all interactive elements are focusable
    this.ensureFocusableElements();
  }

  handleKeyDown(event) {
    const { key, target, ctrlKey, metaKey, shiftKey, altKey } = event;
    
    // Handle arrow key navigation for notes
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      const noteElements = this.container.querySelectorAll('.noteHighlight');
      if (noteElements.length > 0) {
        const currentIndex = Array.from(noteElements).indexOf(target);
        if (currentIndex !== -1) {
          keyboardNavigation.handleArrowNavigation(event, noteElements, currentIndex);
        }
      }
    }

    // Handle Enter/Space for activation
    if ((key === 'Enter' || key === ' ') && target.matches('.noteHighlight, .annotatedWord')) {
      event.preventDefault();
      target.click();
    }

    // Handle Escape for closing modals
    if (key === 'Escape') {
      const activeModal = this.container.querySelector('.notePanel');
      if (activeModal) {
        const closeButton = activeModal.querySelector('.noteCloseButton');
        if (closeButton) {
          closeButton.click();
        }
      }
    }

    // Handle Tab for focus trapping in modals
    if (key === 'Tab') {
      const activeModal = this.container.querySelector('.notePanel');
      if (activeModal) {
        keyboardNavigation.trapFocus(activeModal, event);
      }
    }
  }

  ensureFocusableElements() {
    // Add tabindex to interactive elements that need it
    const interactiveElements = this.container.querySelectorAll('.noteHighlight, .annotatedWord');
    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      if (!element.hasAttribute('role')) {
        element.setAttribute('role', 'button');
      }
    });
  }

  setupFocusManagement() {
    if (!this.options.focusManagement) return;

    // Handle focus restoration when modals close
    this.container.addEventListener('click', (event) => {
      if (event.target.matches('.noteCloseButton, .noteOverlay')) {
        // Focus will be restored by the NotePanel component
      }
    });
  }

  setupScreenReaderSupport() {
    // Add live regions for dynamic content
    this.createLiveRegions();
    
    // Enhanced ARIA labels
    this.enhanceAriaLabels();
    
    // Screen reader specific optimizations
    if (this.options.screenReaderOptimized) {
      this.optimizeForScreenReaders();
    }
  }

  createLiveRegions() {
    // Create polite live region for non-urgent announcements
    if (!document.getElementById('jt2-live-region-polite')) {
      const politeRegion = document.createElement('div');
      politeRegion.id = 'jt2-live-region-polite';
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      document.body.appendChild(politeRegion);
    }

    // Create assertive live region for urgent announcements
    if (!document.getElementById('jt2-live-region-assertive')) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'jt2-live-region-assertive';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
    }
  }

  enhanceAriaLabels() {
    // Add comprehensive ARIA labels to text blocks
    const textBlocks = this.container.querySelectorAll('.textBlock');
    textBlocks.forEach((block, index) => {
      const text = block.querySelector('.textContent')?.textContent || '';
      const translation = block.querySelector('.translationText')?.textContent || '';
      const hasNotes = block.querySelectorAll('.noteHighlight').length > 0;
      const hasFurigana = block.querySelectorAll('.rubyText').length > 0;
      
      const description = screenReader.describeElement({
        type: '文本块',
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        hasNotes,
        hasFurigana,
        translation: translation.substring(0, 30) + (translation.length > 30 ? '...' : '')
      });
      
      block.setAttribute('aria-label', description);
    });

    // Add labels to control elements
    const controls = this.container.querySelectorAll('.toggleInput');
    controls.forEach(control => {
      const label = control.closest('.toggleLabel')?.querySelector('.toggleText')?.textContent;
      if (label && !control.getAttribute('aria-label')) {
        const isChecked = control.checked;
        control.setAttribute('aria-label', generateAriaLabels.toggle(label, isChecked));
      }
    });
  }

  optimizeForScreenReaders() {
    // Add skip links
    this.addSkipLinks();
    
    // Enhance navigation landmarks
    this.enhanceNavigationLandmarks();
    
    // Add reading order indicators
    this.addReadingOrderIndicators();
  }

  addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links sr-only';
    skipLinks.innerHTML = `
      <a href="#jt2-main-content" class="skip-link">跳转到主要内容</a>
      <a href="#jt2-controls" class="skip-link">跳转到控制面板</a>
    `;
    
    // Add CSS for skip links
    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
      }
      .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(style);
    
    this.container.insertBefore(skipLinks, this.container.firstChild);
  }

  enhanceNavigationLandmarks() {
    // Add main landmark
    const mainContent = this.container.querySelector('.content');
    if (mainContent && !mainContent.hasAttribute('role')) {
      mainContent.setAttribute('role', 'main');
      mainContent.id = 'jt2-main-content';
    }

    // Add navigation landmark for controls
    const controls = this.container.querySelector('.controls');
    if (controls && !controls.hasAttribute('role')) {
      controls.setAttribute('role', 'navigation');
      controls.setAttribute('aria-label', '文本显示控制');
      controls.id = 'jt2-controls';
    }
  }

  addReadingOrderIndicators() {
    const textBlocks = this.container.querySelectorAll('.textBlock');
    textBlocks.forEach((block, index) => {
      block.setAttribute('aria-posinset', index + 1);
      block.setAttribute('aria-setsize', textBlocks.length);
    });
  }

  setupHighContrastSupport() {
    // Detect high contrast mode
    if (visualAccessibility.prefersHighContrast()) {
      this.container.classList.add('high-contrast');
      this.enhanceHighContrastElements();
    }

    // Listen for contrast preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addListener((e) => {
      if (e.matches) {
        this.container.classList.add('high-contrast');
        this.enhanceHighContrastElements();
      } else {
        this.container.classList.remove('high-contrast');
      }
    });
  }

  enhanceHighContrastElements() {
    // Add high contrast borders to interactive elements
    const interactiveElements = this.container.querySelectorAll('.noteHighlight, .annotatedWord, button');
    interactiveElements.forEach(element => {
      element.style.border = '1px solid currentColor';
    });

    // Ensure sufficient contrast for ruby text
    const rubyTexts = this.container.querySelectorAll('.rubyText');
    rubyTexts.forEach(rt => {
      rt.style.opacity = '1';
      rt.style.fontWeight = '600';
    });
  }

  setupReducedMotionSupport() {
    if (visualAccessibility.prefersReducedMotion()) {
      this.container.classList.add('reduced-motion');
      this.disableAnimations();
    }

    // Listen for motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addListener((e) => {
      if (e.matches) {
        this.container.classList.add('reduced-motion');
        this.disableAnimations();
      } else {
        this.container.classList.remove('reduced-motion');
      }
    });
  }

  disableAnimations() {
    // Add CSS to disable animations
    const style = document.createElement('style');
    style.textContent = `
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Public methods for announcing changes
  announceChange(message, priority = 'polite') {
    if (!this.options.announceChanges) return;
    
    const regionId = priority === 'assertive' ? 'jt2-live-region-assertive' : 'jt2-live-region-polite';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  announceNoteOpened(noteText, noteContent) {
    const message = `笔记已打开：${noteText}。内容：${noteContent.substring(0, 100)}${noteContent.length > 100 ? '...' : ''}`;
    this.announceChange(message, 'polite');
  }

  announceNoteClosed() {
    this.announceChange('笔记已关闭', 'polite');
  }

  announcePreferenceChange(preference, value) {
    const messages = {
      showFurigana: value ? '注音显示已开启' : '注音显示已关闭',
      showTranslation: value ? '翻译显示已开启' : '翻译显示已关闭',
      showNotes: value ? '笔记显示已开启' : '笔记显示已关闭',
      showLineNumbers: value ? '行号显示已开启' : '行号显示已关闭'
    };
    
    const message = messages[preference] || `${preference} 已${value ? '开启' : '关闭'}`;
    this.announceChange(message, 'polite');
  }

  // Cleanup method
  destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Remove live regions
    const politeRegion = document.getElementById('jt2-live-region-polite');
    const assertiveRegion = document.getElementById('jt2-live-region-assertive');
    
    if (politeRegion) politeRegion.remove();
    if (assertiveRegion) assertiveRegion.remove();
  }
}

/**
 * Hook for using accessibility manager
 * @param {React.RefObject} containerRef - Reference to container element
 * @param {Object} options - Accessibility options
 * @returns {AccessibilityManager} Accessibility manager instance
 */
export const useAccessibilityManager = (containerRef, options = {}) => {
  const [manager, setManager] = useState(null);

  useEffect(() => {
    if (containerRef.current) {
      const accessibilityManager = new AccessibilityManager(containerRef.current, options);
      setManager(accessibilityManager);
      
      return () => {
        accessibilityManager.destroy();
      };
    }
  }, [containerRef, options]);

  return manager;
};