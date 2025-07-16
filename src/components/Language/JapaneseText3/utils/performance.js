import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from './textProcessing';
import { PERFORMANCE_THRESHOLDS } from './constants';

/**
 * Performance optimization utilities for JapaneseText2 component
 */

/**
 * Custom hook for memoizing expensive text processing operations
 * @param {Function} processingFunction - Function to memoize
 * @param {Array} dependencies - Dependencies array
 * @returns {any} Memoized result
 */
export const useTextProcessingMemo = (processingFunction, dependencies) => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = processingFunction();
    const endTime = performance.now();
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const duration = endTime - startTime;
      if (duration > 100) { // Log if processing takes more than 100ms
        console.warn(`Slow text processing detected: ${duration.toFixed(2)}ms`);
      }
    }
    
    return result;
  }, dependencies);
};

/**
 * Custom hook for debounced callbacks
 * @param {Function} callback - Callback function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Debounced callback
 */
export const useDebouncedCallback = (callback, delay = PERFORMANCE_THRESHOLDS.DEBOUNCE_DELAY, dependencies = []) => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay, ...dependencies]
  );
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedCallback.cancel) {
        debouncedCallback.cancel();
      }
    };
  }, [debouncedCallback]);
  
  return debouncedCallback;
};

/**
 * Custom hook for throttled callbacks
 * @param {Function} callback - Callback function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Throttled callback
 */
export const useThrottledCallback = (callback, limit = PERFORMANCE_THRESHOLDS.THROTTLE_DELAY, dependencies = []) => {
  return useMemo(
    () => throttle(callback, limit),
    [callback, limit, ...dependencies]
  );
};

/**
 * Custom hook for intersection observer (lazy loading)
 * @param {Object} options - Intersection observer options
 * @returns {Array} [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [options]);
  
  return [elementRef, isIntersecting];
};

/**
 * Custom hook for virtual scrolling
 * @param {Array} items - Array of items to virtualize
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of the container
 * @returns {Object} Virtual scrolling data
 */
export const useVirtualScrolling = (items, itemHeight = 100, containerHeight = 600) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    if (items.length <= PERFORMANCE_THRESHOLDS.VIRTUAL_SCROLL_THRESHOLD) {
      // Don't virtualize for small lists
      return {
        items,
        startIndex: 0,
        endIndex: items.length - 1,
        offsetY: 0,
        totalHeight: items.length * itemHeight
      };
    }
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    
    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;
    const totalHeight = items.length * itemHeight;
    
    return {
      items: visibleItems,
      startIndex,
      endIndex,
      offsetY,
      totalHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const handleScroll = useThrottledCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, PERFORMANCE_THRESHOLDS.THROTTLE_DELAY);
  
  return {
    ...visibleItems,
    handleScroll
  };
};

/**
 * Performance monitoring hook
 * @param {string} componentName - Name of the component to monitor
 * @returns {Object} Performance monitoring functions
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const lastRenderTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
    
    lastRenderTime.current = currentTime;
    
    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`${componentName}: Slow render detected (${renderTime.toFixed(2)}ms)`);
      }
      
      if (renderCount.current % 10 === 0) {
        const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
        console.log(`${componentName}: Avg render time: ${avgRenderTime.toFixed(2)}ms (${renderCount.current} renders)`);
      }
    }
  });
  
  const getPerformanceStats = useCallback(() => {
    const avgRenderTime = renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0;
    
    return {
      renderCount: renderCount.current,
      averageRenderTime: avgRenderTime,
      lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
      recentRenderTimes: [...renderTimes.current]
    };
  }, []);
  
  return { getPerformanceStats };
};

/**
 * Memory usage monitoring hook
 * @returns {Object} Memory usage information
 */
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }
    };
    
    // Update memory info every 5 seconds
    const interval = setInterval(updateMemoryInfo, 5000);
    updateMemoryInfo(); // Initial update
    
    return () => clearInterval(interval);
  }, []);
  
  const getMemoryUsagePercentage = useCallback(() => {
    if (!memoryInfo) return 0;
    return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  }, [memoryInfo]);
  
  return {
    memoryInfo,
    getMemoryUsagePercentage,
    isMemoryPressure: getMemoryUsagePercentage() > 80
  };
};

/**
 * Optimized event handler creator
 * @param {Function} handler - Event handler function
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Optimized event handler
 */
export const useOptimizedEventHandler = (handler, dependencies = []) => {
  return useCallback(handler, dependencies);
};

/**
 * Batch state updates for better performance
 * @param {Object} initialState - Initial state object
 * @returns {Array} [state, batchedSetState]
 */
export const useBatchedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef({});
  const updateTimeout = useRef(null);
  
  const batchedSetState = useCallback((updates) => {
    // Merge with pending updates
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    // Clear existing timeout
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    
    // Batch updates in next tick
    updateTimeout.current = setTimeout(() => {
      setState(prevState => ({ ...prevState, ...pendingUpdates.current }));
      pendingUpdates.current = {};
      updateTimeout.current = null;
    }, 0);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, []);
  
  return [state, batchedSetState];
};