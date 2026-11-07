const CACHE_NAME = 'attention-v1';
const ASSETS = [
  '/leading/',
  '/leading/index.html',
  '/leading/login.html',
  '/leading/register.html',
  '/leading/feed.html',
  '/leading/leading.css',
  '/leading/style.css',
  '/leading/register.css',
  '/leading/login.js',
  '/leading/register.js',
  '/leading/script.js',
  '/leading/logo192.png',
  '/leading/logo512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Принудительно активируем сразу
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Берем под контроль открытые вкладки
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
