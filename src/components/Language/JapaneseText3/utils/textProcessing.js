// Text processing utilities for Japanese text handling

/**
 * Parses different text data formats into a normalized structure
 * @param {Object} props - Component props containing text data
 * @returns {Object} Normalized text data
 */
export const parseTextData = (props) => {
  const { texts, translations, annotations, fullText, notes } = props;
  
  if (fullText && Array.isArray(fullText)) {
    // Handle fullText format: [[text, annotation, translation], ...]
    return {
      texts: fullText.map(item => item[0] || ''),
      annotations: fullText.map(item => item[1] || {}),
      translations: fullText.map(item => item[2] || ''),
      notes: parseNotes(notes)
    };
  }
  
  // Handle separate arrays format
  return {
    texts: texts || [],
    annotations: annotations || [],
    translations: translations || [],
    notes: parseNotes(notes)
  };
};

/**
 * Normalizes notes data structure
 * @param {Array|Object} notes - Notes in various formats
 * @returns {Object} Normalized notes object
 */
export const parseNotes = (notes) => {
  if (!notes) return {};
  
  if (Array.isArray(notes)) {
    // Convert array format to object format
    const notesObj = {};
    notes.forEach((sentenceNotes, index) => {
      if (sentenceNotes && sentenceNotes.length > 0) {
        notesObj[index] = {};
        sentenceNotes.forEach(noteItem => {
          const key = noteItem.startIndex !== undefined 
            ? `${noteItem.text}_${noteItem.startIndex}`
            : noteItem.text;
          notesObj[index][key] = {
            content: noteItem.note || noteItem.content,
            type: noteItem.type,
            difficulty: noteItem.difficulty,
            tags: noteItem.tags || []
          };
        });
      }
    });
    return notesObj;
  }
  
  // Already in object format, just normalize the structure
  const normalizedNotes = {};
  Object.keys(notes).forEach(sentenceIndex => {
    const sentenceNotes = notes[sentenceIndex];
    normalizedNotes[sentenceIndex] = {};
    
    Object.keys(sentenceNotes).forEach(noteKey => {
      const noteValue = sentenceNotes[noteKey];
      normalizedNotes[sentenceIndex][noteKey] = typeof noteValue === 'string'
        ? { content: noteValue, type: 'vocabulary', difficulty: 'intermediate', tags: [] }
        : noteValue;
    });
  });
  
  return normalizedNotes;
};

/**
 * Finds text segments that need highlighting (annotations or notes)
 * @param {string} text - The text to process
 * @param {Object} annotation - Annotation data for the text
 * @param {Object} notes - Notes data for the text
 * @returns {Array} Array of text segments with metadata
 */
export const segmentText = (text, annotation = {}, notes = {}) => {
  const segments = [];
  const highlights = new Map();
  
  // Add annotations to highlights
  Object.keys(annotation).forEach(word => {
    const index = text.indexOf(word);
    if (index !== -1) {
      highlights.set(index, {
        text: word,
        type: 'annotation',
        data: annotation[word],
        length: word.length
      });
    }
  });
  
  // Add notes to highlights
  Object.keys(notes).forEach(noteKey => {
    let noteText = noteKey;
    let targetIndex = -1;
    
    if (noteKey.includes('_')) {
      const [text, startIndexStr] = noteKey.split('_');
      const startIndex = parseInt(startIndexStr);
      noteText = text;
      targetIndex = startIndex;
    } else {
      targetIndex = text.indexOf(noteText);
    }
    
    if (targetIndex !== -1) {
      highlights.set(targetIndex, {
        text: noteText,
        type: 'note',
        data: notes[noteKey],
        length: noteText.length
      });
    }
  });
  
  // Sort highlights by position
  const sortedHighlights = Array.from(highlights.entries())
    .sort(([a], [b]) => a - b);
  
  let currentIndex = 0;
  
  sortedHighlights.forEach(([position, highlight]) => {
    // Add plain text before highlight
    if (position > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, position),
        type: 'plain'
      });
    }
    
    // Add highlighted segment
    segments.push({
      text: highlight.text,
      type: highlight.type,
      data: highlight.data,
      position: position
    });
    
    currentIndex = position + highlight.length;
  });
  
  // Add remaining plain text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      type: 'plain'
    });
  }
  
  return segments.length > 0 ? segments : [{ text, type: 'plain' }];
};

/**
 * Validates text data structure
 * @param {Object} textData - Parsed text data
 * @returns {Object} Validation result with errors if any
 */
export const validateTextData = (textData) => {
  const errors = [];
  const warnings = [];
  
  if (!textData.texts || !Array.isArray(textData.texts)) {
    errors.push('texts must be an array');
  }
  
  if (textData.annotations && !Array.isArray(textData.annotations)) {
    errors.push('annotations must be an array');
  }
  
  if (textData.translations && !Array.isArray(textData.translations)) {
    errors.push('translations must be an array');
  }
  
  // Check array length consistency
  const textCount = textData.texts?.length || 0;
  if (textData.annotations && textData.annotations.length !== textCount) {
    warnings.push('annotations array length does not match texts array length');
  }
  
  if (textData.translations && textData.translations.length !== textCount) {
    warnings.push('translations array length does not match texts array length');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};