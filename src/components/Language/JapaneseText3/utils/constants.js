// Configuration constants for JapaneseText2 component

export const THEMES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark'
};

export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

export const LINE_SPACING = {
  COMPACT: 'compact',
  NORMAL: 'normal',
  RELAXED: 'relaxed'
};

export const NOTE_TYPES = {
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  CULTURAL: 'cultural',
  PRONUNCIATION: 'pronunciation'
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

export const ANIMATION_SPEEDS = {
  SLOW: 'slow',
  NORMAL: 'normal',
  FAST: 'fast'
};

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
};

export const DEFAULT_PREFERENCES = {
  display: {
    showFurigana: true,
    showTranslation: true,
    showNotes: true,
    showLineNumbers: false,
    compactMode: false
  },
  typography: {
    fontSize: FONT_SIZES.MEDIUM,
    lineSpacing: LINE_SPACING.NORMAL,
    fontFamily: 'system'
  },
  interaction: {
    hoverDelay: 200,
    animationSpeed: ANIMATION_SPEEDS.NORMAL,
    keyboardShortcuts: true,
    autoScrollOnNavigation: true, // Auto-scroll when navigating with keyboard
    smoothScrolling: true // Use smooth scrolling behavior
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false
  }
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_FURIGANA: 'KeyF',
  TOGGLE_TRANSLATION: 'KeyT',
  TOGGLE_NOTES: 'KeyN',
  TOGGLE_LINE_NUMBERS: 'KeyL',
  CLOSE_NOTE: 'Escape',
  NEXT_NOTE: 'ArrowRight',
  PREV_NOTE: 'ArrowLeft',
  INCREASE_FONT: 'Equal',
  DECREASE_FONT: 'Minus'
};

export const TOUCH_TARGETS = {
  MIN_SIZE: 44, // Minimum touch target size in pixels
  PADDING: 8    // Additional padding for touch targets
};

export const PERFORMANCE_THRESHOLDS = {
  VIRTUAL_SCROLL_THRESHOLD: 100, // Items before virtual scrolling kicks in
  DEBOUNCE_DELAY: 300,          // Debounce delay for search/filter
  THROTTLE_DELAY: 16            // Throttle delay for scroll events (60fps)
};

export const Z_INDEX = {
  STICKY_CONTROLS: 10,
  NOTE_OVERLAY: 999,
  NOTE_PANEL: 1000,
  ERROR_BOUNDARY: 9999
};

export const CSS_CUSTOM_PROPERTIES = {
  // Font sizes
  '--font-size-small': '0.875rem',
  '--font-size-medium': '1rem',
  '--font-size-large': '1.125rem',
  
  // Line heights
  '--line-height-compact': '1.4',
  '--line-height-normal': '1.6',
  '--line-height-relaxed': '1.8',
  
  // Spacing
  '--spacing-xs': '0.25rem',
  '--spacing-sm': '0.5rem',
  '--spacing-md': '1rem',
  '--spacing-lg': '1.5rem',
  '--spacing-xl': '2rem',
  
  // Animation durations
  '--duration-fast': '150ms',
  '--duration-normal': '250ms',
  '--duration-slow': '350ms',
  
  // Border radius
  '--radius-sm': '4px',
  '--radius-md': '8px',
  '--radius-lg': '12px',
  '--radius-xl': '16px'
};

// Note positioning configuration
export const NOTE_POSITIONING = {
  // Note panel dimensions (should match CSS)
  DESKTOP_WIDTH: 360,
  DESKTOP_HEIGHT: 320,
  MOBILE_WIDTH_PERCENT: 90,
  MOBILE_HEIGHT_PERCENT: 80,
  
  // Positioning margins and offsets
  SAFE_MARGIN: 24,
  TARGET_OFFSET: 16,
  MOBILE_MIN_MARGIN: 20,
  
  // Positioning strategies priority order
  STRATEGIES: [
    'right',
    'left', 
    'center-below',
    'center-above',
    'center-horizontal',
    'center-vertical',
    'emergency-center'
  ],
  
  // Debounce delays
  POSITION_DEBOUNCE: 50,
  RESIZE_DEBOUNCE: 150,
  VALIDATION_DELAYS: [16, 100, 250],
  
  // Space thresholds for positioning decisions
  SPACE_THRESHOLD: 0.8 // 80% of panel size needed for preferred positioning
};