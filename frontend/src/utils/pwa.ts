/**
 * PWA and Service Worker utilities
 * Handles service worker registration and offline functionality
 */

/**
 * Register the service worker
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered successfully:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update().catch((error) => {
        console.error('[PWA] Error checking for service worker updates:', error);
      });
    }, 60000); // Check every minute

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Unregister all service workers
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
    console.log('[PWA] All service workers unregistered');
  } catch (error) {
    console.error('[PWA] Error unregistering service workers:', error);
  }
};

/**
 * Check if running in offline mode
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listen for online/offline events
 */
export const subscribeToOnlineStatus = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Install PWA (trigger installation dialog)
 */
let deferredPrompt: any = null;

export const captureBeforeInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
  });
};

export const promptUserToInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  console.log(`[PWA] User responded to install prompt: ${outcome}`);
  return outcome === 'accepted';
};

export const isInstallable = (): boolean => {
  return deferredPrompt !== null;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications are not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Send a notification
 */
export const sendNotification = async (title: string, options?: NotificationOptions) => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker not available');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      ...options,
    });
  } catch (error) {
    console.error('[PWA] Error sending notification:', error);
  }
};

/**
 * Get installation status
 */
export const getInstallationStatus = async (): Promise<'installed' | 'installable' | 'not-installable'> => {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'installed';
  }

  // Check if installable
  if (deferredPrompt !== null) {
    return 'installable';
  }

  return 'not-installable';
};

/**
 * Cache analytics data for offline sync
 */
export const cacheAnalyticData = async (data: any) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('multilingo-analytics-v1');
      await cache.put(new Request('/analytics'), new Response(JSON.stringify(data)));
    }
  } catch (error) {
    console.error('[PWA] Error caching analytics:', error);
  }
};

/**
 * Sync pending conversations
 */
export const syncPendingConversations = async () => {
  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('sync-messages');
      console.log('[PWA] Sync registered');
    }
  } catch (error) {
    console.error('[PWA] Error registering sync:', error);
  }
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  isOnline,
  subscribeToOnlineStatus,
  promptUserToInstall,
  isInstallable,
  requestNotificationPermission,
  sendNotification,
  getInstallationStatus,
  cacheAnalyticData,
  syncPendingConversations,
};
