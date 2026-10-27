const CACHE_NAME = 'attention-cache-v1';
const ASSETS_TO_CACHE = [
  '/feed.html',
  '/index.html',
  '/login.html',
  '/register.html',
  '/style.css'
];

// Установка сервис-воркера и кэширование основных файлов
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log(' PWA: Файлы успешно кэшированы при установке');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Активация и удаление старого кэша, если он изменился
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== CACHE_NAME) {
            console.log(' PWA: Старый кэш удален');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Перехват запросов (работа приложения в офлайне или при плохом интернете)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
