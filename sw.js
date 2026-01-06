const CACHE_NAME = 'coffee-v2'; // Змінюй версію, щоб оновити кеш
const DYNAMIC_CACHE = 'coffee-dynamic-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './coffee.jpg',
    './offline.html',
    './manifest.json'
];

// Встановлення: Кешуємо основні файли
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('SW: Кешування файлів');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Активація: Видаляємо старий кеш
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
                .map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// Перехоплення запитів (Fetch)
self.addEventListener('fetch', event => {
    // Стратегія для API: Спочатку мережа, потім кеш
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request).then(res => {
                const clone = res.clone();
                caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
                return res;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    // Стратегія для файлів: Кеш, якщо немає - мережа
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).catch(() => {
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./offline.html');
                }
            });
        })
    );
});

// Фонова синхронізація (Background Sync)
self.addEventListener('sync', event => {
    if (event.tag === 'send-order') {
        console.log('SW: Синхронізація замовлення...');
        // Імітація відправки
        event.waitUntil(
            Promise.resolve().then(() => {
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage('Замовлення успішно відправлено!'));
                });
            })
        );
    }
});

// Обробка повідомлень від додатка
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});