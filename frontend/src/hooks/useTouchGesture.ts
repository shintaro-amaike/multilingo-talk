import { useRef, useEffect } from 'react';
import {
  onSwipe,
  onLongPress,
  onPinch,
  triggerHapticFeedback,
  SwipeGesture,
  TouchPosition,
} from '../utils/touch';

interface UseTouchGestureOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onLongPress?: (position: TouchPosition) => void;
  onPinch?: (scale: number, centerX: number, centerY: number) => void;
  minSwipeDistance?: number;
  longPressDuration?: number;
  hapticFeedback?: boolean;
}

/**
 * Hook for handling touch gestures on an element
 */
export const useTouchGesture = (options: UseTouchGestureOptions = {}) => {
  const elementRef = useRef<HTMLElement>(null);
  const {
    onSwipe: onSwipeCallback,
    onLongPress: onLongPressCallback,
    onPinch: onPinchCallback,
    minSwipeDistance = 50,
    longPressDuration = 500,
    hapticFeedback = true,
  } = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const unsubscribers: Array<() => void> = [];

    // Setup swipe handler
    if (onSwipeCallback) {
      const unsubscribe = onSwipe(
        elementRef.current,
        (gesture) => {
          if (hapticFeedback) {
            triggerHapticFeedback('light');
          }
          onSwipeCallback(gesture);
        },
        minSwipeDistance
      );
      unsubscribers.push(unsubscribe);
    }

    // Setup long-press handler
    if (onLongPressCallback) {
      const unsubscribe = onLongPress(
        elementRef.current,
        (position) => {
          if (hapticFeedback) {
            triggerHapticFeedback('medium');
          }
          onLongPressCallback(position);
        },
        longPressDuration
      );
      unsubscribers.push(unsubscribe);
    }

    // Setup pinch handler
    if (onPinchCallback) {
      const unsubscribe = onPinch(elementRef.current, onPinchCallback);
      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [onSwipeCallback, onLongPressCallback, onPinchCallback, hapticFeedback, minSwipeDistance, longPressDuration]);

  return elementRef;
};

export default useTouchGesture;
