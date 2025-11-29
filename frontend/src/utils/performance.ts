/**
 * Performance optimization utilities
 * Includes image lazy loading, request debouncing, and performance monitoring
 */

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * Throttle function to limit function calls at intervals
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  interval: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= interval) {
      func(...args);
      lastCallTime = now;
    }
  };
};

/**
 * Setup lazy loading for images
 */
export const setupImageLazyLoading = (selector: string = 'img[data-src]'): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  const images = document.querySelectorAll<HTMLImageElement>(selector);
  images.forEach((img) => {
    imageObserver.observe(img);
  });
};

/**
 * Monitor performance metrics
 */
export const getPerformanceMetrics = () => {
  const metrics: Record<string, number> = {};

  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    metrics.domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    metrics.resourcesLoadTime = timing.responseEnd - timing.fetchStart;
    metrics.basePageLoadTime = timing.responseEnd - timing.navigationStart;
    metrics.domInteractiveTime = timing.domInteractive - timing.navigationStart;
    metrics.navigationStart = timing.navigationStart;

    // Resource timing
    if (window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      metrics.resourceCount = resources.length;
    }
  }

  // Memory info (if available)
  if ((performance as any).memory) {
    const memory = (performance as any).memory;
    metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    metrics.jsHeapSizeUsed = memory.jsHeapSizeUsed;
    metrics.jsHeapSizeUsedPercent = (memory.jsHeapSizeUsed / memory.jsHeapSizeLimit) * 100;
  }

  return metrics;
};

/**
 * Log performance metrics to console
 */
export const logPerformanceMetrics = (): void => {
  const metrics = getPerformanceMetrics();
  console.group('Performance Metrics');
  Object.entries(metrics).forEach(([key, value]) => {
    const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
    console.log(`${key}:`, displayValue);
  });
  console.groupEnd();
};

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback = (
  callback: (deadline: IdleDeadline) => void,
  options?: IdleRequestOptions
): number => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback using setTimeout
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50.0 - (Date.now() - start)),
    } as IdleDeadline);
  }, 1) as unknown as number;
};

/**
 * Cancel idle callback
 */
export const cancelIdleCallback = (id: number): void => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Prefetch a URL for faster loading
 */
export const prefetchUrl = (url: string, as: 'style' | 'script' | 'image' = 'script'): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Preload a URL for immediate access
 */
export const preloadUrl = (url: string, as: 'style' | 'script' | 'image' = 'script'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Request animation frame wrapper with fallback
 */
export const requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.requestAnimationFrame(callback);
};

/**
 * Measure performance of a function
 */
export const measureFunctionPerformance = async <T>(
  func: () => Promise<T>,
  label: string = 'Function'
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await func();
    const duration = performance.now() - start;
    console.log(`${label} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

export default {
  debounce,
  throttle,
  setupImageLazyLoading,
  getPerformanceMetrics,
  logPerformanceMetrics,
  requestIdleCallback,
  cancelIdleCallback,
  prefetchUrl,
  preloadUrl,
  requestAnimationFrame,
  measureFunctionPerformance,
};
