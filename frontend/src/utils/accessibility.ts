/**
 * Accessibility utilities for ARIA, keyboard navigation, and screen readers
 */

/**
 * Generate a unique ID for ARIA attributes
 */
let idCounter = 0;
export const generateId = (prefix: string = 'element'): string => {
  idCounter++;
  return `${prefix}-${idCounter}`;
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  // Create or find the aria-live region
  let liveRegion = document.getElementById('aria-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Update the live region content
  liveRegion.textContent = message;
  liveRegion.setAttribute('aria-live', priority);
};

/**
 * Trap focus within a modal or dialog
 */
export const createFocusTrap = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a, button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]'
  );

  if (focusableElements.length === 0) {
    return () => {};
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element initially
  firstElement.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Skip navigation link setup
 */
export const setupSkipLink = (targetSelector: string = '#main-content'): void => {
  const skipLink = document.createElement('a');
  skipLink.href = targetSelector;
  skipLink.className = 'skip-to-content';
  skipLink.textContent = 'Skip to main content';

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .skip-to-content {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    }
    .skip-to-content:focus {
      top: 0;
    }
  `;

  document.head.appendChild(style);
  document.body.insertBefore(skipLink, document.body.firstChild);

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(targetSelector) as HTMLElement;
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  });
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Create a keyboard shortcut handler
 */
export const createKeyboardShortcut = (
  key: string,
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  },
  callback: (e: KeyboardEvent) => void
): (() => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const modCheck =
      (!modifiers.ctrl || e.ctrlKey || e.metaKey) &&
      (!modifiers.shift || e.shiftKey) &&
      (!modifiers.alt || e.altKey);

    if (e.key.toLowerCase() === key.toLowerCase() && modCheck) {
      e.preventDefault();
      callback(e);
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Set ARIA attributes for loading state
 */
export const setLoadingState = (element: HTMLElement, isLoading: boolean): void => {
  if (isLoading) {
    element.setAttribute('aria-busy', 'true');
    element.setAttribute('aria-disabled', 'true');
  } else {
    element.setAttribute('aria-busy', 'false');
    element.setAttribute('aria-disabled', 'false');
  }
};

/**
 * Set ARIA attributes for error state
 */
export const setErrorState = (
  element: HTMLElement,
  errorId: string,
  hasError: boolean
): void => {
  if (hasError) {
    element.setAttribute('aria-invalid', 'true');
    element.setAttribute('aria-describedby', errorId);
  } else {
    element.setAttribute('aria-invalid', 'false');
    element.removeAttribute('aria-describedby');
  }
};

/**
 * Set ARIA attributes for expanded state
 */
export const setExpandedState = (element: HTMLElement, isExpanded: boolean): void => {
  element.setAttribute('aria-expanded', isExpanded.toString());
};

/**
 * Create an accessible alert
 */
export const showAccessibleAlert = (
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
): HTMLElement => {
  const alertId = generateId('alert');
  const alert = document.createElement('div');

  alert.id = alertId;
  alert.role = 'alert';
  alert.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  alert.textContent = message;

  // Style the alert
  alert.style.padding = '12px 16px';
  alert.style.marginBottom = '16px';
  alert.style.borderRadius = '4px';
  alert.style.fontSize = '14px';

  const colorMap = {
    info: '#1976d2',
    warning: '#ff9800',
    error: '#f44336',
    success: '#4caf50',
  };

  alert.style.backgroundColor = colorMap[type];
  alert.style.color = '#fff';

  // Insert into DOM
  const container = document.querySelector('[role="main"]') || document.body;
  container.insertBefore(alert, container.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);

  return alert;
};

/**
 * Make element keyboard accessible
 */
export const makeKeyboardAccessible = (
  element: HTMLElement,
  callback: () => void
): void => {
  if (!element.hasAttribute('role')) {
    element.setAttribute('role', 'button');
  }

  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  element.addEventListener('keydown', handleKeyDown);
};

/**
 * Set ARIA label for screen readers
 */
export const setAriaLabel = (element: HTMLElement, label: string): void => {
  element.setAttribute('aria-label', label);
};

/**
 * Set ARIA description for screen readers
 */
export const setAriaDescription = (element: HTMLElement, descriptionId: string): void => {
  element.setAttribute('aria-describedby', descriptionId);
};

export default {
  generateId,
  announceToScreenReader,
  createFocusTrap,
  setupSkipLink,
  prefersReducedMotion,
  createKeyboardShortcut,
  setLoadingState,
  setErrorState,
  setExpandedState,
  showAccessibleAlert,
  makeKeyboardAccessible,
  setAriaLabel,
  setAriaDescription,
};
