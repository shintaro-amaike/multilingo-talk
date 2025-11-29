import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateId,
  announceToScreenReader,
  prefersReducedMotion,
  setLoadingState,
  setErrorState,
  setExpandedState,
  makeKeyboardAccessible,
  setAriaLabel,
  setAriaDescription,
} from './accessibility';

describe('Accessibility Utilities', () => {
  describe('generateId', () => {
    beforeEach(() => {
      // Reset ID counter
      // (This would need to be exposed in production code for testing)
    });

    it('should generate unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-\d+$/);
      expect(id2).toMatch(/^test-\d+$/);
    });

    it('should use default prefix if not provided', () => {
      const id = generateId();
      expect(id).toMatch(/^element-\d+$/);
    });
  });

  describe('announceToScreenReader', () => {
    let liveRegion: HTMLElement;

    afterEach(() => {
      const existing = document.getElementById('aria-live-region');
      if (existing) {
        existing.remove();
      }
    });

    it('should create aria-live region if not exists', () => {
      announceToScreenReader('Test message');
      liveRegion = document.getElementById('aria-live-region')!;

      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion.textContent).toBe('Test message');
    });

    it('should set proper aria-live priority', () => {
      announceToScreenReader('Urgent message', 'assertive');
      liveRegion = document.getElementById('aria-live-region')!;

      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('should update existing region with new message', () => {
      announceToScreenReader('First message');
      announceToScreenReader('Second message');

      liveRegion = document.getElementById('aria-live-region')!;
      expect(liveRegion.textContent).toBe('Second message');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return boolean', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });

    it('should match window.matchMedia', () => {
      const result = prefersReducedMotion();
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(result).toBe(mediaQuery.matches);
    });
  });

  describe('setLoadingState', () => {
    it('should set aria-busy and aria-disabled to true when loading', () => {
      const element = document.createElement('div');
      setLoadingState(element, true);

      expect(element).toHaveAttribute('aria-busy', 'true');
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });

    it('should set aria-busy and aria-disabled to false when not loading', () => {
      const element = document.createElement('div');
      setLoadingState(element, false);

      expect(element).toHaveAttribute('aria-busy', 'false');
      expect(element).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('setErrorState', () => {
    it('should set aria-invalid and aria-describedby when error exists', () => {
      const element = document.createElement('div');
      setErrorState(element, 'error-id', true);

      expect(element).toHaveAttribute('aria-invalid', 'true');
      expect(element).toHaveAttribute('aria-describedby', 'error-id');
    });

    it('should remove error attributes when error is false', () => {
      const element = document.createElement('div');
      setErrorState(element, 'error-id', true);
      setErrorState(element, 'error-id', false);

      expect(element).toHaveAttribute('aria-invalid', 'false');
      expect(element).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('setExpandedState', () => {
    it('should set aria-expanded to true', () => {
      const element = document.createElement('div');
      setExpandedState(element, true);

      expect(element).toHaveAttribute('aria-expanded', 'true');
    });

    it('should set aria-expanded to false', () => {
      const element = document.createElement('div');
      setExpandedState(element, false);

      expect(element).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('makeKeyboardAccessible', () => {
    it('should add role and tabindex', () => {
      const element = document.createElement('div');
      const callback = vi.fn();

      makeKeyboardAccessible(element, callback);

      expect(element).toHaveAttribute('role', 'button');
      expect(element).toHaveAttribute('tabindex', '0');
    });

    it('should call callback on Enter key', () => {
      const element = document.createElement('div');
      const callback = vi.fn();

      makeKeyboardAccessible(element, callback);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
    });

    it('should call callback on Space key', () => {
      const element = document.createElement('div');
      const callback = vi.fn();

      makeKeyboardAccessible(element, callback);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      element.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
    });

    it('should not call callback on other keys', () => {
      const element = document.createElement('div');
      const callback = vi.fn();

      makeKeyboardAccessible(element, callback);

      const event = new KeyboardEvent('keydown', { key: 'a' });
      element.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('setAriaLabel', () => {
    it('should set aria-label attribute', () => {
      const element = document.createElement('div');
      setAriaLabel(element, 'Close button');

      expect(element).toHaveAttribute('aria-label', 'Close button');
    });
  });

  describe('setAriaDescription', () => {
    it('should set aria-describedby attribute', () => {
      const element = document.createElement('div');
      setAriaDescription(element, 'description-id');

      expect(element).toHaveAttribute('aria-describedby', 'description-id');
    });
  });
});
