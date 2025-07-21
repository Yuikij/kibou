import { useState, useCallback, useEffect, useRef } from 'react';
import { BREAKPOINTS, NOTE_POSITIONING } from '../utils/constants';

/**
 * Custom hook for note management and positioning
 * @param {Array} processedTexts - Processed text data with notes
 * @param {Object} preferences - User preferences including scroll behavior
 * @returns {Object} Note handling functions and state
 */
export const useNoteHandling = (processedTexts = [], preferences = {}) => {
  const [isMobile, setIsMobile] = useState(false);
  const noteRefs = useRef(new Map());

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Register note element reference
  const registerNoteRef = useCallback((sentenceIndex, noteKey, element) => {
    if (element) {
      noteRefs.current.set(`${sentenceIndex}_${noteKey}`, element);
    } else {
      noteRefs.current.delete(`${sentenceIndex}_${noteKey}`);
    }
  }, []);

  // Get note statistics (simplified)
  const getAllNotes = useCallback(() => {
    const allNotes = [];
    processedTexts.forEach((sentence, sentenceIndex) => {
      if (sentence.notes) {
        Object.entries(sentence.notes).forEach(([noteKey, noteContent]) => {
          allNotes.push({
            sentenceIndex,
            noteKey,
            content: noteContent,
            text: noteKey.includes('_') ? noteKey.split('_')[0] : noteKey
          });
        });
      }
    });
    return allNotes;
  }, [processedTexts]);

  return {
    isMobile,
    registerNoteRef,
    getAllNotes
  };
};