import { useState, useCallback, useEffect, useRef } from 'react';
import { BREAKPOINTS } from '../utils/constants';

/**
 * Custom hook for note management and positioning
 * @param {Array} processedTexts - Processed text data with notes
 * @returns {Object} Note handling functions and state
 */
export const useNoteHandling = (processedTexts = []) => {
  const [activeNote, setActiveNote] = useState(null);
  const [notePosition, setNotePosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const noteRefs = useRef(new Map());
  const activeNoteRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= BREAKPOINTS.MOBILE);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get all notes in order for navigation
  const allNotes = useState(() => {
    const notes = [];
    processedTexts.forEach((textData, sentenceIndex) => {
      Object.keys(textData.notes || {}).forEach(noteKey => {
        const noteData = textData.notes[noteKey];
        notes.push({
          sentenceIndex,
          noteKey,
          text: noteKey.includes('_') ? noteKey.split('_')[0] : noteKey,
          content: typeof noteData === 'string' ? noteData : noteData.content,
          type: typeof noteData === 'object' ? noteData.type : 'vocabulary',
          difficulty: typeof noteData === 'object' ? noteData.difficulty : 'intermediate'
        });
      });
    });
    return notes;
  })[0];

  // Calculate optimal note position with improved boundary detection
  const calculateNotePosition = useCallback((targetElement) => {
    if (!targetElement) return { top: 0, left: 0 };

    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    if (isMobile) {
      // Center on mobile with safe area consideration
      return {
        top: Math.max(50, viewportHeight / 2) + scrollY,
        left: Math.max(20, viewportWidth / 2) + scrollX,
        centered: true
      };
    }

    // Desktop positioning with enhanced smart placement
    const noteWidth = 380; // Account for padding and borders
    const noteHeight = 300; // Account for content variations
    const safeMargin = 20; // Increased safe margin
    const targetOffset = 12; // Distance from target element
    
    // Calculate available space in all directions with safe margins
    const spaceRight = viewportWidth - rect.right - safeMargin;
    const spaceLeft = rect.left - safeMargin;
    const spaceBelow = viewportHeight - rect.bottom - safeMargin;
    const spaceAbove = rect.top - safeMargin;
    
    let left, top;
    let placement = 'right';
    
    // Enhanced horizontal positioning with fallback chain
    if (spaceRight >= noteWidth) {
      // Preferred: Place to the right
      left = rect.right + scrollX + targetOffset;
      placement = 'right';
    } else if (spaceLeft >= noteWidth) {
      // Fallback 1: Place to the left
      left = rect.left + scrollX - noteWidth - targetOffset;
      placement = 'left';
    } else if (viewportWidth >= noteWidth + (safeMargin * 2)) {
      // Fallback 2: Center horizontally with safe margins
      left = Math.max(
        safeMargin + scrollX,
        Math.min(
          viewportWidth - noteWidth - safeMargin + scrollX,
          rect.left + scrollX + (rect.width - noteWidth) / 2
        )
      );
      placement = 'center';
    } else {
      // Fallback 3: Force fit with minimal margins for very narrow screens
      left = safeMargin + scrollX;
      placement = 'center';
    }
    
    // Enhanced vertical positioning with better target alignment
    if (placement === 'right' || placement === 'left') {
      // For side placement, align with target center but keep within bounds
      const targetCenterY = rect.top + rect.height / 2;
      const idealTop = targetCenterY - noteHeight / 2 + scrollY;
      
      if (spaceBelow >= noteHeight * 0.7 && spaceAbove >= noteHeight * 0.3) {
        // Enough space for centered alignment
        top = Math.max(
          safeMargin + scrollY,
          Math.min(
            viewportHeight - noteHeight - safeMargin + scrollY,
            idealTop
          )
        );
      } else if (spaceBelow >= noteHeight) {
        // Align with target top
        top = Math.max(safeMargin + scrollY, rect.top + scrollY);
      } else if (spaceAbove >= noteHeight) {
        // Place above target
        top = Math.max(safeMargin + scrollY, rect.bottom + scrollY - noteHeight);
      } else {
        // Force fit vertically
        top = Math.max(
          safeMargin + scrollY,
          Math.min(
            viewportHeight - noteHeight - safeMargin + scrollY,
            targetCenterY - noteHeight / 2 + scrollY
          )
        );
      }
    } else {
      // For center placement, prefer below target
      if (spaceBelow >= noteHeight) {
        top = rect.bottom + scrollY + targetOffset;
      } else if (spaceAbove >= noteHeight) {
        top = rect.top + scrollY - noteHeight - targetOffset;
      } else {
        // Center vertically as last resort
        top = Math.max(
          safeMargin + scrollY,
          Math.min(
            viewportHeight - noteHeight - safeMargin + scrollY,
            (viewportHeight - noteHeight) / 2 + scrollY
          )
        );
      }
    }
    
    // Final safety checks with more aggressive boundary enforcement
    const finalLeft = Math.max(
      safeMargin + scrollX,
      Math.min(viewportWidth - noteWidth - safeMargin + scrollX, left)
    );
    
    const finalTop = Math.max(
      safeMargin + scrollY,
      Math.min(viewportHeight - noteHeight - safeMargin + scrollY, top)
    );

    return { 
      top: finalTop, 
      left: finalLeft, 
      placement,
      // Enhanced positioning metadata
      positioning: {
        strategy: placement,
        hasSpaceRight: spaceRight >= noteWidth,
        hasSpaceLeft: spaceLeft >= noteWidth,
        hasSpaceBelow: spaceBelow >= noteHeight,
        hasSpaceAbove: spaceAbove >= noteHeight,
        targetRect: {
          top: rect.top + scrollY,
          left: rect.left + scrollX,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2 + scrollX,
          centerY: rect.top + rect.height / 2 + scrollY
        }
      }
    };
  }, [isMobile]);

  // Handle note click
  const handleNoteClick = useCallback((noteKey, noteContent, event, sentenceIndex) => {
    if (!noteContent) return;

    event.preventDefault();
    event.stopPropagation();

    const position = calculateNotePosition(event.target);
    setNotePosition(position);

    const displayText = noteKey.includes('_') ? noteKey.split('_')[0] : noteKey;
    const noteData = typeof noteContent === 'string' 
      ? { content: noteContent, type: 'vocabulary' }
      : noteContent;

    setActiveNote({
      text: displayText,
      content: noteData.content,
      type: noteData.type || 'vocabulary',
      difficulty: noteData.difficulty || 'intermediate',
      tags: noteData.tags || [],
      sentenceIndex,
      noteKey
    });

    // Store reference for keyboard navigation
    activeNoteRef.current = {
      sentenceIndex,
      noteKey,
      element: event.target
    };

    // Enhanced post-render positioning validation and correction
    const validateAndCorrectPosition = () => {
      const notePanel = document.querySelector('[class*="notePanel"]');
      if (!notePanel) return;

      const panelRect = notePanel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      let needsReposition = false;
      let newPosition = { ...position };
      const safeMargin = 20;
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Note panel visibility check:', {
          panelRect: {
            top: panelRect.top,
            left: panelRect.left,
            right: panelRect.right,
            bottom: panelRect.bottom,
            width: panelRect.width,
            height: panelRect.height
          },
          viewport: { width: viewportWidth, height: viewportHeight },
          scroll: { x: scrollX, y: scrollY },
          originalPosition: position,
          isVisible: {
            horizontal: panelRect.left >= 0 && panelRect.right <= viewportWidth,
            vertical: panelRect.top >= 0 && panelRect.bottom <= viewportHeight
          }
        });
      }
      
      // Comprehensive visibility checks with progressive fallbacks
      
      // Check horizontal bounds
      if (panelRect.right > viewportWidth - safeMargin) {
        // Panel extends beyond right edge
        const maxLeft = viewportWidth - panelRect.width - safeMargin;
        newPosition.left = Math.max(safeMargin + scrollX, maxLeft + scrollX);
        needsReposition = true;
      }
      
      if (panelRect.left < safeMargin) {
        // Panel extends beyond left edge
        newPosition.left = safeMargin + scrollX;
        needsReposition = true;
      }
      
      // Check vertical bounds
      if (panelRect.bottom > viewportHeight - safeMargin) {
        // Panel extends beyond bottom edge
        const maxTop = viewportHeight - panelRect.height - safeMargin;
        newPosition.top = Math.max(safeMargin + scrollY, maxTop + scrollY);
        needsReposition = true;
      }
      
      if (panelRect.top < safeMargin) {
        // Panel extends beyond top edge
        newPosition.top = safeMargin + scrollY;
        needsReposition = true;
      }
      
      // Emergency fallback: if panel is still problematic, force center
      if (needsReposition) {
        // Validate the new position would actually work
        const wouldFitHorizontally = newPosition.left >= safeMargin + scrollX && 
          newPosition.left + panelRect.width <= viewportWidth - safeMargin + scrollX;
        const wouldFitVertically = newPosition.top >= safeMargin + scrollY && 
          newPosition.top + panelRect.height <= viewportHeight - safeMargin + scrollY;
        
        if (!wouldFitHorizontally || !wouldFitVertically) {
          // Force center as last resort
          newPosition = {
            top: Math.max(
              safeMargin + scrollY,
              (viewportHeight - Math.min(panelRect.height, viewportHeight - safeMargin * 2)) / 2 + scrollY
            ),
            left: Math.max(
              safeMargin + scrollX,
              (viewportWidth - Math.min(panelRect.width, viewportWidth - safeMargin * 2)) / 2 + scrollX
            ),
            centered: true
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.warn('Note panel forced to center due to sizing constraints');
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Repositioning note panel:', {
            from: position,
            to: newPosition,
            reason: 'visibility correction'
          });
        }
        
        setNotePosition(newPosition);
      }
    };

    // Use multiple validation passes to ensure positioning
    setTimeout(validateAndCorrectPosition, 16); // First pass - immediate
    setTimeout(validateAndCorrectPosition, 100); // Second pass - after animations
  }, [calculateNotePosition]);

  // Close note panel
  const closeNote = useCallback(() => {
    setActiveNote(null);
    activeNoteRef.current = null;
  }, []);

  // Navigate to next/previous note
  const navigateNote = useCallback((direction) => {
    if (!activeNote || allNotes.length === 0) return;

    const currentIndex = allNotes.findIndex(
      note => note.sentenceIndex === activeNote.sentenceIndex && 
               note.noteKey === activeNote.noteKey
    );

    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % allNotes.length;
    } else {
      newIndex = currentIndex === 0 ? allNotes.length - 1 : currentIndex - 1;
    }

    const nextNote = allNotes[newIndex];
    const noteElement = noteRefs.current.get(`${nextNote.sentenceIndex}-${nextNote.noteKey}`);
    
    if (noteElement) {
      // Simulate click on the next note element
      const syntheticEvent = {
        target: noteElement,
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      
      handleNoteClick(
        nextNote.noteKey,
        nextNote.content,
        syntheticEvent,
        nextNote.sentenceIndex
      );

      // Scroll element into view
      noteElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [activeNote, allNotes, handleNoteClick]);

  // Register note element reference
  const registerNoteRef = useCallback((sentenceIndex, noteKey, element) => {
    const key = `${sentenceIndex}-${noteKey}`;
    if (element) {
      noteRefs.current.set(key, element);
    } else {
      noteRefs.current.delete(key);
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!activeNote) return;

    switch (event.key) {
      case 'Escape':
        closeNote();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        navigateNote('next');
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        navigateNote('prev');
        break;
      default:
        break;
    }
  }, [activeNote, closeNote, navigateNote]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (activeNote) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeNote, handleKeyDown]);

  // Handle click outside to close note
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeNote && !event.target.closest('.notePanel') && !event.target.closest('.noteHighlight')) {
        closeNote();
      }
    };

    if (activeNote) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeNote, closeNote]);

  // Get note statistics
  const noteStatistics = {
    totalNotes: allNotes.length,
    notesByType: allNotes.reduce((acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1;
      return acc;
    }, {}),
    notesByDifficulty: allNotes.reduce((acc, note) => {
      acc[note.difficulty] = (acc[note.difficulty] || 0) + 1;
      return acc;
    }, {})
  };

  return {
    activeNote,
    notePosition,
    isMobile,
    allNotes,
    noteStatistics,
    handleNoteClick,
    closeNote,
    navigateNote,
    registerNoteRef,
    hasNotes: allNotes.length > 0
  };
};