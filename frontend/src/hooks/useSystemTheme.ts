import { useEffect, useState } from 'react';

/**
 * Hook to detect system dark mode preference
 * Returns true if user prefers dark mode at OS level
 */
export const useSystemTheme = (): {
  prefersDarkMode: boolean;
  prefersLightMode: boolean;
  supportsColorScheme: boolean;
} => {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [prefersLightMode, setPrefersLightMode] = useState(false);
  const [supportsColorScheme, setSupportsColorScheme] = useState(false);

  useEffect(() => {
    // Check if the browser supports prefers-color-scheme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');

    setSupportsColorScheme(darkModeQuery.media !== 'not all');

    // Set initial values
    setPrefersDarkMode(darkModeQuery.matches);
    setPrefersLightMode(lightModeQuery.matches);

    // Listen for changes
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };

    const handleLightModeChange = (e: MediaQueryListEvent) => {
      setPrefersLightMode(e.matches);
    };

    // Use addEventListener if available (newer browsers), fallback to addListener
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleDarkModeChange);
      lightModeQuery.addEventListener('change', handleLightModeChange);
    } else {
      darkModeQuery.addListener(handleDarkModeChange);
      lightModeQuery.addListener(handleLightModeChange);
    }

    // Cleanup
    return () => {
      if (darkModeQuery.removeEventListener) {
        darkModeQuery.removeEventListener('change', handleDarkModeChange);
        lightModeQuery.removeEventListener('change', handleLightModeChange);
      } else {
        darkModeQuery.removeListener(handleDarkModeChange);
        lightModeQuery.removeListener(handleLightModeChange);
      }
    };
  }, []);

  return {
    prefersDarkMode,
    prefersLightMode,
    supportsColorScheme,
  };
};

export default useSystemTheme;
