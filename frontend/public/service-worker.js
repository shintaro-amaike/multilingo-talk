/**
 * Service Worker for MultiLingo Talk PWA
 * Handles offline functionality and caching strategies
 */

const CACHE_NAME = 'multilingo-talk-v1';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

// List of URLs to cache during installation
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/styles/main.css',
];

/**
 * Install event: Cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential files');
      return cache.addAll(urlsToCache).catch((err) => {
        console.error('[Service Worker] Cache error:', err);
      });
    })
  );

  self.skipWaiting();
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/**
 * Fetch event: Implement cache-first strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external URLs
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // API requests: Network first, fallback to cache
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Offline: Return cached response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((response) => {
          // Cache new static assets
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Fallback to offline page if available
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_FALLBACK_PAGE);
          }
        });
    })
  );
});

/**
 * Handle background sync (future feature)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

/**
 * Sync messages when connection is restored
 */
async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    // Send them to the server
    // Clear from IndexedDB
    console.log('[Service Worker] Messages synced');
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
    throw error;
  }
}

/**
 * Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'MultiLingo Talk';
  const options = {
    body: data.body || 'New learning notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'multilingo-notification',
    ...data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
