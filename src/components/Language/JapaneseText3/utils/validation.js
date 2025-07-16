// Validation utilities for JapaneseText2 component

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Validation result class
 */
export class ValidationResult {
  constructor(isValid = true, errors = [], warnings = []) {
    this.isValid = isValid;
    this.errors = errors;
    this.warnings = warnings;
  }

  addError(message, field, value) {
    this.errors.push(new ValidationError(message, field, value));
    this.isValid = false;
    return this;
  }

  addWarning(message, field, value) {
    this.warnings.push({ message, field, value });
    return this;
  }

  merge(other) {
    this.errors.push(...other.errors);
    this.warnings.push(...other.warnings);
    this.isValid = this.isValid && other.isValid;
    return this;
  }
}

/**
 * Validates component props
 * @param {Object} props - Component props to validate
 * @returns {ValidationResult} Validation result
 */
export const validateProps = (props) => {
  const result = new ValidationResult();
  
  // Validate texts prop
  if (props.texts !== undefined) {
    if (!Array.isArray(props.texts)) {
      result.addError('texts must be an array', 'texts', props.texts);
    } else if (props.texts.length === 0) {
      result.addWarning('texts array is empty', 'texts', props.texts);
    } else {
      props.texts.forEach((text, index) => {
        if (typeof text !== 'string') {
          result.addError(`texts[${index}] must be a string`, `texts[${index}]`, text);
        } else if (text.trim().length === 0) {
          result.addWarning(`texts[${index}] is empty or whitespace only`, `texts[${index}]`, text);
        }
      });
    }
  }

  // Validate translations prop
  if (props.translations !== undefined) {
    if (!Array.isArray(props.translations)) {
      result.addError('translations must be an array', 'translations', props.translations);
    } else if (props.texts && props.translations.length !== props.texts.length) {
      result.addWarning(
        `translations array length (${props.translations.length}) does not match texts array length (${props.texts?.length || 0})`,
        'translations',
        props.translations
      );
    } else {
      props.translations.forEach((translation, index) => {
        if (translation !== null && translation !== undefined && typeof translation !== 'string') {
          result.addError(`translations[${index}] must be a string or null/undefined`, `translations[${index}]`, translation);
        }
      });
    }
  }

  // Validate annotations prop
  if (props.annotations !== undefined) {
    if (!Array.isArray(props.annotations)) {
      result.addError('annotations must be an array', 'annotations', props.annotations);
    } else if (props.texts && props.annotations.length !== props.texts.length) {
      result.addWarning(
        `annotations array length (${props.annotations.length}) does not match texts array length (${props.texts?.length || 0})`,
        'annotations',
        props.annotations
      );
    } else {
      props.annotations.forEach((annotation, index) => {
        if (annotation !== null && annotation !== undefined) {
          if (typeof annotation !== 'object' || Array.isArray(annotation)) {
            result.addError(`annotations[${index}] must be an object or null/undefined`, `annotations[${index}]`, annotation);
          } else {
            Object.entries(annotation).forEach(([key, value]) => {
              if (typeof key !== 'string' || typeof value !== 'string') {
                result.addError(
                  `annotations[${index}]["${key}"] must have string key and value`,
                  `annotations[${index}]["${key}"]`,
                  { key, value }
                );
              }
            });
          }
        }
      });
    }
  }

  // Validate fullText prop
  if (props.fullText !== undefined) {
    if (!Array.isArray(props.fullText)) {
      result.addError('fullText must be an array', 'fullText', props.fullText);
    } else {
      props.fullText.forEach((item, index) => {
        if (!Array.isArray(item)) {
          result.addError(`fullText[${index}] must be an array`, `fullText[${index}]`, item);
        } else if (item.length < 1 || item.length > 3) {
          result.addError(
            `fullText[${index}] must have 1-3 elements [text, annotation?, translation?]`,
            `fullText[${index}]`,
            item
          );
        } else {
          // Validate text (required)
          if (typeof item[0] !== 'string') {
            result.addError(`fullText[${index}][0] (text) must be a string`, `fullText[${index}][0]`, item[0]);
          }
          
          // Validate annotation (optional)
          if (item.length > 1 && item[1] !== null && item[1] !== undefined) {
            if (typeof item[1] !== 'object' || Array.isArray(item[1])) {
              result.addError(`fullText[${index}][1] (annotation) must be an object or null/undefined`, `fullText[${index}][1]`, item[1]);
            }
          }
          
          // Validate translation (optional)
          if (item.length > 2 && item[2] !== null && item[2] !== undefined) {
            if (typeof item[2] !== 'string') {
              result.addError(`fullText[${index}][2] (translation) must be a string or null/undefined`, `fullText[${index}][2]`, item[2]);
            }
          }
        }
      });
    }
  }

  // Validate notes prop
  if (props.notes !== undefined) {
    result.merge(validateNotes(props.notes));
  }

  // Validate preferences prop
  if (props.initialPreferences !== undefined) {
    result.merge(validatePreferences(props.initialPreferences));
  }

  return result;
};

/**
 * Validates notes data structure
 * @param {Object|Array} notes - Notes data to validate
 * @returns {ValidationResult} Validation result
 */
export const validateNotes = (notes) => {
  const result = new ValidationResult();
  
  if (notes === null || notes === undefined) {
    return result;
  }

  if (Array.isArray(notes)) {
    // Array format validation
    notes.forEach((sentenceNotes, index) => {
      if (sentenceNotes !== null && sentenceNotes !== undefined) {
        if (!Array.isArray(sentenceNotes)) {
          result.addError(`notes[${index}] must be an array or null/undefined`, `notes[${index}]`, sentenceNotes);
        } else {
          sentenceNotes.forEach((noteItem, noteIndex) => {
            if (typeof noteItem !== 'object' || Array.isArray(noteItem)) {
              result.addError(
                `notes[${index}][${noteIndex}] must be an object`,
                `notes[${index}][${noteIndex}]`,
                noteItem
              );
            } else {
              // Validate required fields
              if (!noteItem.text || typeof noteItem.text !== 'string') {
                result.addError(
                  `notes[${index}][${noteIndex}].text is required and must be a string`,
                  `notes[${index}][${noteIndex}].text`,
                  noteItem.text
                );
              }
              
              if (!noteItem.note && !noteItem.content) {
                result.addError(
                  `notes[${index}][${noteIndex}] must have either 'note' or 'content' field`,
                  `notes[${index}][${noteIndex}]`,
                  noteItem
                );
              }
              
              // Validate optional fields
              if (noteItem.startIndex !== undefined && typeof noteItem.startIndex !== 'number') {
                result.addError(
                  `notes[${index}][${noteIndex}].startIndex must be a number`,
                  `notes[${index}][${noteIndex}].startIndex`,
                  noteItem.startIndex
                );
              }
              
              if (noteItem.type !== undefined && typeof noteItem.type !== 'string') {
                result.addError(
                  `notes[${index}][${noteIndex}].type must be a string`,
                  `notes[${index}][${noteIndex}].type`,
                  noteItem.type
                );
              }
              
              if (noteItem.difficulty !== undefined && typeof noteItem.difficulty !== 'string') {
                result.addError(
                  `notes[${index}][${noteIndex}].difficulty must be a string`,
                  `notes[${index}][${noteIndex}].difficulty`,
                  noteItem.difficulty
                );
              }
              
              if (noteItem.tags !== undefined && !Array.isArray(noteItem.tags)) {
                result.addError(
                  `notes[${index}][${noteIndex}].tags must be an array`,
                  `notes[${index}][${noteIndex}].tags`,
                  noteItem.tags
                );
              }
            }
          });
        }
      }
    });
  } else if (typeof notes === 'object') {
    // Object format validation
    Object.entries(notes).forEach(([sentenceIndex, sentenceNotes]) => {
      if (!/^\d+$/.test(sentenceIndex)) {
        result.addWarning(
          `notes key "${sentenceIndex}" should be a numeric string`,
          `notes["${sentenceIndex}"]`,
          sentenceIndex
        );
      }
      
      if (typeof sentenceNotes !== 'object' || Array.isArray(sentenceNotes)) {
        result.addError(
          `notes["${sentenceIndex}"] must be an object`,
          `notes["${sentenceIndex}"]`,
          sentenceNotes
        );
      } else {
        Object.entries(sentenceNotes).forEach(([noteKey, noteValue]) => {
          if (typeof noteKey !== 'string') {
            result.addError(
              `notes["${sentenceIndex}"] key must be a string`,
              `notes["${sentenceIndex}"]["${noteKey}"]`,
              noteKey
            );
          }
          
          if (typeof noteValue !== 'string' && typeof noteValue !== 'object') {
            result.addError(
              `notes["${sentenceIndex}"]["${noteKey}"] must be a string or object`,
              `notes["${sentenceIndex}"]["${noteKey}"]`,
              noteValue
            );
          }
        });
      }
    });
  } else {
    result.addError('notes must be an array or object', 'notes', notes);
  }

  return result;
};

/**
 * Validates user preferences
 * @param {Object} preferences - Preferences to validate
 * @returns {ValidationResult} Validation result
 */
export const validatePreferences = (preferences) => {
  const result = new ValidationResult();
  
  if (typeof preferences !== 'object' || Array.isArray(preferences)) {
    result.addError('preferences must be an object', 'preferences', preferences);
    return result;
  }

  // Validate display preferences
  if (preferences.display !== undefined) {
    if (typeof preferences.display !== 'object' || Array.isArray(preferences.display)) {
      result.addError('preferences.display must be an object', 'preferences.display', preferences.display);
    } else {
      const booleanFields = ['showFurigana', 'showTranslation', 'showNotes', 'showLineNumbers', 'compactMode'];
      booleanFields.forEach(field => {
        if (preferences.display[field] !== undefined && typeof preferences.display[field] !== 'boolean') {
          result.addError(
            `preferences.display.${field} must be a boolean`,
            `preferences.display.${field}`,
            preferences.display[field]
          );
        }
      });
    }
  }

  // Validate typography preferences
  if (preferences.typography !== undefined) {
    if (typeof preferences.typography !== 'object' || Array.isArray(preferences.typography)) {
      result.addError('preferences.typography must be an object', 'preferences.typography', preferences.typography);
    } else {
      const validFontSizes = ['small', 'medium', 'large'];
      if (preferences.typography.fontSize !== undefined && !validFontSizes.includes(preferences.typography.fontSize)) {
        result.addError(
          `preferences.typography.fontSize must be one of: ${validFontSizes.join(', ')}`,
          'preferences.typography.fontSize',
          preferences.typography.fontSize
        );
      }
      
      const validLineSpacing = ['compact', 'normal', 'relaxed'];
      if (preferences.typography.lineSpacing !== undefined && !validLineSpacing.includes(preferences.typography.lineSpacing)) {
        result.addError(
          `preferences.typography.lineSpacing must be one of: ${validLineSpacing.join(', ')}`,
          'preferences.typography.lineSpacing',
          preferences.typography.lineSpacing
        );
      }
      
      if (preferences.typography.fontFamily !== undefined && typeof preferences.typography.fontFamily !== 'string') {
        result.addError(
          'preferences.typography.fontFamily must be a string',
          'preferences.typography.fontFamily',
          preferences.typography.fontFamily
        );
      }
    }
  }

  // Validate interaction preferences
  if (preferences.interaction !== undefined) {
    if (typeof preferences.interaction !== 'object' || Array.isArray(preferences.interaction)) {
      result.addError('preferences.interaction must be an object', 'preferences.interaction', preferences.interaction);
    } else {
      if (preferences.interaction.hoverDelay !== undefined && typeof preferences.interaction.hoverDelay !== 'number') {
        result.addError(
          'preferences.interaction.hoverDelay must be a number',
          'preferences.interaction.hoverDelay',
          preferences.interaction.hoverDelay
        );
      }
      
      const validAnimationSpeeds = ['slow', 'normal', 'fast'];
      if (preferences.interaction.animationSpeed !== undefined && !validAnimationSpeeds.includes(preferences.interaction.animationSpeed)) {
        result.addError(
          `preferences.interaction.animationSpeed must be one of: ${validAnimationSpeeds.join(', ')}`,
          'preferences.interaction.animationSpeed',
          preferences.interaction.animationSpeed
        );
      }
      
      if (preferences.interaction.keyboardShortcuts !== undefined && typeof preferences.interaction.keyboardShortcuts !== 'boolean') {
        result.addError(
          'preferences.interaction.keyboardShortcuts must be a boolean',
          'preferences.interaction.keyboardShortcuts',
          preferences.interaction.keyboardShortcuts
        );
      }
    }
  }

  // Validate accessibility preferences
  if (preferences.accessibility !== undefined) {
    if (typeof preferences.accessibility !== 'object' || Array.isArray(preferences.accessibility)) {
      result.addError('preferences.accessibility must be an object', 'preferences.accessibility', preferences.accessibility);
    } else {
      const booleanFields = ['highContrast', 'reducedMotion', 'screenReaderOptimized'];
      booleanFields.forEach(field => {
        if (preferences.accessibility[field] !== undefined && typeof preferences.accessibility[field] !== 'boolean') {
          result.addError(
            `preferences.accessibility.${field} must be a boolean`,
            `preferences.accessibility.${field}`,
            preferences.accessibility[field]
          );
        }
      });
    }
  }

  return result;
};

/**
 * Sanitizes and normalizes input data
 * @param {Object} props - Props to sanitize
 * @returns {Object} Sanitized props
 */
export const sanitizeProps = (props) => {
  const sanitized = { ...props };

  // Sanitize texts
  if (Array.isArray(sanitized.texts)) {
    sanitized.texts = sanitized.texts.map(text => 
      typeof text === 'string' ? text.trim() : String(text).trim()
    ).filter(text => text.length > 0);
  }

  // Sanitize translations
  if (Array.isArray(sanitized.translations)) {
    sanitized.translations = sanitized.translations.map(translation => 
      translation === null || translation === undefined ? '' : String(translation).trim()
    );
  }

  // Sanitize annotations
  if (Array.isArray(sanitized.annotations)) {
    sanitized.annotations = sanitized.annotations.map(annotation => {
      if (!annotation || typeof annotation !== 'object') return {};
      
      const sanitizedAnnotation = {};
      Object.entries(annotation).forEach(([key, value]) => {
        const sanitizedKey = String(key).trim();
        const sanitizedValue = String(value).trim();
        if (sanitizedKey && sanitizedValue) {
          sanitizedAnnotation[sanitizedKey] = sanitizedValue;
        }
      });
      return sanitizedAnnotation;
    });
  }

  return sanitized;
};

/**
 * Creates a user-friendly error message from validation result
 * @param {ValidationResult} validationResult - Validation result
 * @returns {string} User-friendly error message
 */
export const createErrorMessage = (validationResult) => {
  if (validationResult.isValid) {
    return '';
  }

  const errorMessages = validationResult.errors.map(error => {
    switch (error.field) {
      case 'texts':
        return '文本数据格式不正确。请确保提供有效的文本数组。';
      case 'translations':
        return '翻译数据格式不正确。请确保翻译数组与文本数组长度一致。';
      case 'annotations':
        return '注音数据格式不正确。请确保注音数据为有效的对象数组。';
      case 'notes':
        return '笔记数据格式不正确。请检查笔记数据结构。';
      case 'preferences':
        return '偏好设置格式不正确。请检查设置参数。';
      default:
        return `数据验证失败：${error.message}`;
    }
  });

  return errorMessages.join(' ');
};