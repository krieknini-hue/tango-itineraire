const CACHE_NAME = 'tango-itineraire-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.webmanifest'
];

// Installation : mise en cache du shell de l'application
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Mise en cache des tuiles OpenStreetMap pour consultation hors-ligne sur la route
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('tile.openstreetmap.fr')
  ) {
    event.respondWith(
      caches.open('tango-osm-tiles').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);
        });
      })
    );
    return;
  }

  // Cache-first avec fallback réseau pour les assets de l'application
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback page d'accueil si navigation HTML hors-ligne
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
