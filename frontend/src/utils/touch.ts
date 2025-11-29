/**
 * Touch and gesture utilities for mobile optimization
 * Provides swipe detection, long-press, and haptic feedback
 */

// Touch event tracking
interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
  velocity: number;
}

/**
 * Calculate distance between two touch positions
 */
export const calculateDistance = (pos1: TouchPosition, pos2: TouchPosition): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Detect swipe gesture direction and metrics
 */
export const detectSwipeGesture = (
  startPos: TouchPosition,
  endPos: TouchPosition,
  minDistance: number = 50
): SwipeGesture | null => {
  const distance = calculateDistance(startPos, endPos);
  const duration = endPos.timestamp - startPos.timestamp;
  const velocity = duration > 0 ? distance / duration : 0;

  if (distance < minDistance) {
    return null; // Not a swipe
  }

  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;

  let direction: 'left' | 'right' | 'up' | 'down';

  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'down' : 'up';
  }

  return {
    direction,
    distance,
    duration,
    velocity,
  };
};

/**
 * Create a swipe event listener
 * Returns unsubscribe function
 */
export const onSwipe = (
  element: HTMLElement,
  callback: (gesture: SwipeGesture) => void,
  minDistance: number = 50
): (() => void) => {
  let touchStartPos: TouchPosition | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartPos = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartPos) return;

    const touch = e.changedTouches[0];
    if (touch) {
      const touchEndPos: TouchPosition = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      const gesture = detectSwipeGesture(touchStartPos, touchEndPos, minDistance);
      if (gesture) {
        callback(gesture);
      }
    }

    touchStartPos = null;
  };

  element.addEventListener('touchstart', handleTouchStart, false);
  element.addEventListener('touchend', handleTouchEnd, false);

  // Return unsubscribe function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart, false);
    element.removeEventListener('touchend', handleTouchEnd, false);
  };
};

/**
 * Create a long-press event listener
 * Returns unsubscribe function
 */
export const onLongPress = (
  element: HTMLElement,
  callback: (position: TouchPosition) => void,
  duration: number = 500
): (() => void) => {
  let touchStartPos: TouchPosition | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let isMoved = false;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartPos = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };
      isMoved = false;

      timeoutId = setTimeout(() => {
        if (!isMoved && touchStartPos) {
          callback(touchStartPos);
          // Trigger haptic feedback
          triggerHapticFeedback('medium');
        }
      }, duration);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartPos) return;

    const touch = e.touches[0];
    if (touch) {
      const distance = calculateDistance(touchStartPos, {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });

      // If moved more than 10px, cancel the long press
      if (distance > 10) {
        isMoved = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    touchStartPos = null;
    isMoved = false;
  };

  element.addEventListener('touchstart', handleTouchStart, false);
  element.addEventListener('touchmove', handleTouchMove, false);
  element.addEventListener('touchend', handleTouchEnd, false);

  // Return unsubscribe function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    element.removeEventListener('touchstart', handleTouchStart, false);
    element.removeEventListener('touchmove', handleTouchMove, false);
    element.removeEventListener('touchend', handleTouchEnd, false);
  };
};

/**
 * Trigger haptic feedback (vibration)
 * Falls back gracefully on unsupported devices
 */
export const triggerHapticFeedback = (
  pattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
): void => {
  if (!('vibrate' in navigator)) {
    return; // Not supported
  }

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 20, 10],
    warning: [20, 10, 20],
    error: [30, 10, 30],
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    // Silently fail if vibration not supported
  }
};

/**
 * Prevent default touch behaviors (e.g., pull-to-refresh)
 */
export const preventDefaultTouchBehaviors = (element: HTMLElement): (() => void) => {
  const handleTouchMove = (e: TouchEvent) => {
    // Allow scrolling but prevent pull-to-refresh on Android
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  element.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    element.removeEventListener('touchmove', handleTouchMove);
  };
};

/**
 * Add visual feedback on touch
 */
export const addTouchFeedback = (element: HTMLElement): (() => void) => {
  const originalStyle = element.style.cssText;

  const handleTouchStart = () => {
    element.style.opacity = '0.8';
    element.style.transform = 'scale(0.98)';
    element.style.transition = 'all 0.1s ease';
  };

  const handleTouchEnd = () => {
    element.style.opacity = '1';
    element.style.transform = 'scale(1)';
    // Reset after transition
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, 100);
  };

  element.addEventListener('touchstart', handleTouchStart, false);
  element.addEventListener('touchend', handleTouchEnd, false);

  return () => {
    element.removeEventListener('touchstart', handleTouchStart, false);
    element.removeEventListener('touchend', handleTouchEnd, false);
    element.style.cssText = originalStyle;
  };
};

/**
 * Pinch zoom gesture detection
 */
export const onPinch = (
  element: HTMLElement,
  callback: (scale: number, centerX: number, centerY: number) => void
): (() => void) => {
  let initialDistance = 0;
  let initialScale = 1;

  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < touches.length; i++) {
      sumX += touches[i].clientX;
      sumY += touches[i].clientY;
    }
    return {
      x: sumX / touches.length,
      y: sumY / touches.length,
    };
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance = getTouchDistance(e.touches);
      initialScale = 1;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialDistance;
      const center = getTouchCenter(e.touches);

      callback(scale, center.x, center.y);
    }
  };

  const handleTouchEnd = () => {
    initialDistance = 0;
    initialScale = 1;
  };

  element.addEventListener('touchstart', handleTouchStart, false);
  element.addEventListener('touchmove', handleTouchMove, false);
  element.addEventListener('touchend', handleTouchEnd, false);

  return () => {
    element.removeEventListener('touchstart', handleTouchStart, false);
    element.removeEventListener('touchmove', handleTouchMove, false);
    element.removeEventListener('touchend', handleTouchEnd, false);
  };
};

export default {
  calculateDistance,
  detectSwipeGesture,
  onSwipe,
  onLongPress,
  triggerHapticFeedback,
  preventDefaultTouchBehaviors,
  addTouchFeedback,
  onPinch,
};
