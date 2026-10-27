const CACHE_NAME = 'attention-cache-v2';

// Упрощенная установка без жесткого списка файлов (чтобы не блокировать PWA)
self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log(' PWA Сервис-воркер: Установлен');
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
  console.log(' PWA Сервис-воркер: Активирован');
});

// Перехват запросов «на лету»
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
