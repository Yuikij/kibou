import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PREFERENCES } from '../utils/constants';

/**
 * Custom hook for localStorage-based preference persistence
 * @param {string} key - Storage key
 * @param {Object} initialValue - Initial preferences
 * @returns {Array} [preferences, setPreferences, clearPreferences]
 */
export const useLocalStorage = (key = 'japaneseText2Preferences', initialValue = DEFAULT_PREFERENCES) => {
  const [storedValue, setStoredValue] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Merge with defaults to handle new preference additions
        return mergePreferences(DEFAULT_PREFERENCES, parsed);
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Merge preferences with defaults to handle schema changes
  const mergePreferences = useCallback((defaults, stored) => {
    const merged = { ...defaults };
    
    // Deep merge each section
    Object.keys(defaults).forEach(section => {
      if (stored[section] && typeof stored[section] === 'object') {
        merged[section] = { ...defaults[section], ...stored[section] };
      }
    });
    
    return merged;
  }, []);

  // Validate preferences structure
  const validatePreferences = useCallback((prefs) => {
    const errors = [];
    
    // Check required sections
    const requiredSections = ['display', 'typography', 'interaction', 'accessibility'];
    requiredSections.forEach(section => {
      if (!prefs[section] || typeof prefs[section] !== 'object') {
        errors.push(`Missing or invalid section: ${section}`);
      }
    });
    
    // Validate display preferences
    if (prefs.display) {
      const booleanFields = ['showFurigana', 'showTranslation', 'showNotes', 'showLineNumbers', 'compactMode'];
      booleanFields.forEach(field => {
        if (typeof prefs.display[field] !== 'boolean') {
          errors.push(`Invalid display.${field}: must be boolean`);
        }
      });
    }
    
    // Validate typography preferences
    if (prefs.typography) {
      const validFontSizes = ['small', 'medium', 'large'];
      const validLineSpacing = ['compact', 'normal', 'relaxed'];
      
      if (!validFontSizes.includes(prefs.typography.fontSize)) {
        errors.push(`Invalid typography.fontSize: must be one of ${validFontSizes.join(', ')}`);
      }
      
      if (!validLineSpacing.includes(prefs.typography.lineSpacing)) {
        errors.push(`Invalid typography.lineSpacing: must be one of ${validLineSpacing.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Set value in localStorage
  const setValue = useCallback((value) => {
    try {
      // Validate before storing
      const validation = validatePreferences(value);
      if (!validation.isValid) {
        console.warn('Invalid preferences:', validation.errors);
        return false;
      }
      
      setStoredValue(value);
      
      // Only access localStorage in browser environment
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
        
        // Dispatch custom event for cross-tab synchronization
        window.dispatchEvent(new CustomEvent('japaneseText2PreferencesChanged', {
          detail: { key, value }
        }));
      }
      
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  }, [key, validatePreferences]);

  // Update specific preference
  const updatePreference = useCallback((section, field, value) => {
    setStoredValue(prevPrefs => {
      const newPrefs = {
        ...prevPrefs,
        [section]: {
          ...prevPrefs[section],
          [field]: value
        }
      };
      
      // Save to localStorage only in browser environment
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(newPrefs));
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('japaneseText2PreferencesChanged', {
            detail: { key, value: newPrefs }
          }));
        } catch (error) {
          console.error(`Error updating localStorage key "${key}":`, error);
        }
      }
      
      return newPrefs;
    });
  }, [key]);

  // Clear preferences
  const clearPreferences = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      // Only access localStorage in browser environment
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('japaneseText2PreferencesCleared', {
          detail: { key }
        }));
      }
      
      return true;
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
      return false;
    }
  }, [key, initialValue]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    return setValue(DEFAULT_PREFERENCES);
  }, [setValue]);

  // Export preferences
  const exportPreferences = useCallback(() => {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      preferences: storedValue
    };
  }, [storedValue]);

  // Import preferences
  const importPreferences = useCallback((importData) => {
    try {
      if (!importData.preferences) {
        throw new Error('Invalid import data: missing preferences');
      }
      
      const merged = mergePreferences(DEFAULT_PREFERENCES, importData.preferences);
      return setValue(merged);
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }, [mergePreferences, setValue]);

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    // Only add event listeners in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          const merged = mergePreferences(DEFAULT_PREFERENCES, newValue);
          setStoredValue(merged);
        } catch (error) {
          console.warn('Error parsing storage change:', error);
        }
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('japaneseText2PreferencesChanged', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('japaneseText2PreferencesChanged', handleCustomEvent);
    };
  }, [key, mergePreferences]);

  // Get storage info
  const getStorageInfo = useCallback(() => {
    // Return default info in non-browser environment
    if (typeof window === 'undefined') {
      return {
        exists: false,
        size: 0,
        lastModified: null
      };
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return {
        exists: Boolean(item),
        size: item ? new Blob([item]).size : 0,
        lastModified: item ? new Date().toISOString() : null
      };
    } catch (error) {
      return {
        exists: false,
        size: 0,
        lastModified: null,
        error: error.message
      };
    }
  }, [key]);

  return {
    preferences: storedValue,
    setPreferences: setValue,
    updatePreference,
    clearPreferences,
    resetToDefaults,
    exportPreferences,
    importPreferences,
    getStorageInfo,
    isValid: validatePreferences(storedValue).isValid
  };
};