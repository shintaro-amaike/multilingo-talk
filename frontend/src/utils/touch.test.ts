import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateDistance,
  detectSwipeGesture,
  triggerHapticFeedback,
} from './touch';

describe('Touch Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const pos1 = { x: 0, y: 0, timestamp: 0 };
      const pos2 = { x: 3, y: 4, timestamp: 100 };

      const distance = calculateDistance(pos1, pos2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same position', () => {
      const pos = { x: 10, y: 10, timestamp: 0 };
      const distance = calculateDistance(pos, pos);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const pos1 = { x: -3, y: -4, timestamp: 0 };
      const pos2 = { x: 0, y: 0, timestamp: 100 };

      const distance = calculateDistance(pos1, pos2);
      expect(distance).toBe(5);
    });
  });

  describe('detectSwipeGesture', () => {
    it('should detect right swipe', () => {
      const startPos = { x: 0, y: 0, timestamp: 0 };
      const endPos = { x: 100, y: 0, timestamp: 100 };

      const gesture = detectSwipeGesture(startPos, endPos, 50);
      expect(gesture).not.toBeNull();
      expect(gesture?.direction).toBe('right');
      expect(gesture?.distance).toBe(100);
    });

    it('should detect left swipe', () => {
      const startPos = { x: 100, y: 0, timestamp: 0 };
      const endPos = { x: 0, y: 0, timestamp: 100 };

      const gesture = detectSwipeGesture(startPos, endPos, 50);
      expect(gesture?.direction).toBe('left');
    });

    it('should detect up swipe', () => {
      const startPos = { x: 0, y: 100, timestamp: 0 };
      const endPos = { x: 0, y: 0, timestamp: 100 };

      const gesture = detectSwipeGesture(startPos, endPos, 50);
      expect(gesture?.direction).toBe('up');
    });

    it('should detect down swipe', () => {
      const startPos = { x: 0, y: 0, timestamp: 0 };
      const endPos = { x: 0, y: 100, timestamp: 100 };

      const gesture = detectSwipeGesture(startPos, endPos, 50);
      expect(gesture?.direction).toBe('down');
    });

    it('should return null for small movement', () => {
      const startPos = { x: 0, y: 0, timestamp: 0 };
      const endPos = { x: 10, y: 0, timestamp: 100 };

      const gesture = detectSwipeGesture(startPos, endPos, 50);
      expect(gesture).toBeNull();
    });

    it('should calculate velocity', () => {
      const startPos = { x: 0, y: 0, timestamp: 0 };
      const endPos = { x: 100, y: 0, timestamp: 200 }; // 100px in 200ms

      const gesture = detectSwipeGesture(startPos, endPos, 50);
      expect(gesture?.velocity).toBe(0.5); // 100px / 200ms
    });
  });

  describe('triggerHapticFeedback', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should trigger light vibration', () => {
      triggerHapticFeedback('light');
      expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('should trigger medium vibration', () => {
      triggerHapticFeedback('medium');
      expect(navigator.vibrate).toHaveBeenCalledWith(20);
    });

    it('should trigger heavy vibration', () => {
      triggerHapticFeedback('heavy');
      expect(navigator.vibrate).toHaveBeenCalledWith(30);
    });

    it('should trigger success pattern', () => {
      triggerHapticFeedback('success');
      expect(navigator.vibrate).toHaveBeenCalledWith([10, 20, 10]);
    });

    it('should trigger warning pattern', () => {
      triggerHapticFeedback('warning');
      expect(navigator.vibrate).toHaveBeenCalledWith([20, 10, 20]);
    });

    it('should trigger error pattern', () => {
      triggerHapticFeedback('error');
      expect(navigator.vibrate).toHaveBeenCalledWith([30, 10, 30]);
    });

    it('should not throw error if vibrate is not supported', () => {
      const originalVibrate = navigator.vibrate;
      // @ts-ignore
      delete navigator.vibrate;

      expect(() => {
        triggerHapticFeedback('light');
      }).not.toThrow();

      // Restore
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: originalVibrate,
      });
    });
  });
});
