
// DataWave Sensor Service Worker

const CACHE_NAME = 'datawave-sensor-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gestion des requêtes avec stratégie "network first, fallback to cache"
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'DataWave Sensor',
        message: event.data.text()
      };
    }
  }

  const title = data.title || 'DataWave Sensor';
  const message = data.message || 'Nouvelle alerte de votre aquarium';
  const icon = data.icon || '/icons/icon-192x192.png';
  const badge = data.badge || '/icons/badge-72x72.png';
  const tag = data.tag || 'datawave-notification';
  const url = data.url || '/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: icon,
      badge: badge,
      tag: tag,
      vibrate: [100, 50, 100],
      data: {
        url: url,
        dateOfArrival: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Ouvrir'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ]
    })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir l'application ou une page spécifique
  const urlToOpen = event.notification.data && event.notification.data.url 
    ? new URL(event.notification.data.url, self.location.origin).href
    : self.location.origin;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // Si une fenêtre de l'application est déjà ouverte, la focus
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
