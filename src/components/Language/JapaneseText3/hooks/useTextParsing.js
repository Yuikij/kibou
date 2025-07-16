import { useState, useEffect, useMemo } from 'react';
import { parseTextData, validateTextData, segmentText } from '../utils/textProcessing';

/**
 * Custom hook for text parsing and processing logic
 * @param {Object} props - Component props containing text data
 * @returns {Object} Parsed and processed text data
 */
export const useTextParsing = (props) => {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the parsing result to prevent unnecessary re-parsing
  const textData = useMemo(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const parsed = parseTextData(props);
      const validation = validateTextData(parsed);
      
      if (!validation.isValid) {
        throw new Error(`Invalid text data: ${validation.errors.join(', ')}`);
      }
      
      // Log warnings in development
      if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
        console.warn('JapaneseText2 warnings:', validation.warnings);
      }
      
      return parsed;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [props.texts, props.translations, props.annotations, props.fullText, props.notes]);

  // Process text segments for rendering
  const processedTexts = useMemo(() => {
    if (!textData) return [];
    
    return textData.texts.map((text, index) => {
      const annotation = textData.annotations[index] || {};
      const notes = textData.notes[index] || {};
      const translation = textData.translations[index] || '';
      
      return {
        index,
        text,
        translation,
        annotation,
        notes,
        segments: segmentText(text, annotation, notes),
        hasAnnotations: Object.keys(annotation).length > 0,
        hasNotes: Object.keys(notes).length > 0,
        hasTranslation: Boolean(translation)
      };
    });
  }, [textData]);

  // Statistics about the text data
  const statistics = useMemo(() => {
    if (!processedTexts.length) return null;
    
    return {
      totalTexts: processedTexts.length,
      textsWithAnnotations: processedTexts.filter(t => t.hasAnnotations).length,
      textsWithNotes: processedTexts.filter(t => t.hasNotes).length,
      textsWithTranslations: processedTexts.filter(t => t.hasTranslation).length,
      totalCharacters: processedTexts.reduce((sum, t) => sum + t.text.length, 0),
      averageTextLength: Math.round(
        processedTexts.reduce((sum, t) => sum + t.text.length, 0) / processedTexts.length
      )
    };
  }, [processedTexts]);

  // Update parsed data when processing is complete
  useEffect(() => {
    if (textData && processedTexts.length > 0) {
      setParsedData({
        raw: textData,
        processed: processedTexts,
        statistics
      });
    }
  }, [textData, processedTexts, statistics]);

  return {
    data: parsedData,
    isLoading,
    error,
    isEmpty: !parsedData || parsedData.processed.length === 0
  };
};