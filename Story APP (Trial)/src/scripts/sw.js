import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import CONFIG from './config';
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'Story APP';
const urlsToCache = [
  '/',
  '/index.html',
  '/images/logo.png',
  '/offline.html',
];

// Cache manual saat install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`⚠️ Gagal cache ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Hapus cache lama saat activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// Fallback cache jika fetch gagal (offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/offline.html'); // pastikan file ini dicache dulu!
        }
      });
    })
  );
});

// Cache gambar dari API secara dinamis
registerRoute(
  ({ url }) => {
    const match = url.origin === CONFIG.CACHE_URLL && url.pathname.startsWith('/images/stories/');
    if (match) {
      console.log('📸 Caching image:', url.href);
    } else {
      console.log("coba image");
    }
    return match;
  },
  new CacheFirst({
    cacheName: 'story-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// Notifikasi push
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');

  async function chainPromise() {
    let data = {};
    if (event.data) {
      data = event.data.json();
    }

    const title = data.title || 'Notifikasi Baru';
    const options = {
      body: data.body || 'Kamu punya pesan baru!',
      icon: data.icon || '/images/icons/maskable-icon-x192.png',
      badge: data.badge || '/images/icons/maskable-icon-x192.png',
      data: data.url || '/',
    };

    await self.registration.showNotification(title, options);
  }

  event.waitUntil(chainPromise());
});

// Klik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});