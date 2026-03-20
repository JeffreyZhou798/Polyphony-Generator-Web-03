const CACHE_NAME = 'polyphony-web-v1';

// 静态资源
const STATIC_FILES = [
  '/',
  '/index.html'
];

// Google CDN 模型 URL（预缓存）
const MODEL_URLS = [
  'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn',
  'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 缓存静态文件');
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 优先使用缓存
      if (response) {
        return response;
      }

      // 缓存未命中，从网络获取
      return fetch(event.request).then((response) => {
        // 检查是否是有效响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应
        const responseToCache = response.clone();

        // 缓存模型文件和静态资源
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
