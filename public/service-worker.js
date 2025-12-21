const CACHE_NAME = 'pos-system-v1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/javascript.js',
  '/manifest.json',
  '/offline.html'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(error => {
        // Return cached version or offline page
        return caches.match(request).then(response => {
          return response || caches.match('/offline.html');
        });
      })
  );
});

// Background Sync (optional - for offline form submissions)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-invoices') {
    event.waitUntil(syncInvoices());
  }
});

async function syncInvoices() {
  try {
    // Sync logic for offline data
    const db = await openIndexedDB();
    const unsyncedData = await getUnsyncedData(db);
    
    if (unsyncedData.length > 0) {
      await Promise.all(
        unsyncedData.map(data =>
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        )
      );
      await clearUnsyncedData(db);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push Notifications (optional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'تم تحديث التطبيق',
    icon: '/images/icon-192.png',
    badge: '/images/badge.png',
    tag: 'notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('POS System', options)
  );
});
