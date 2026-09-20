const CACHE_NAME = 'schedule-v27';
const ASSETS = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './apple-splash-1179-2556.png', './apple-splash-1206-2622.png',
  './apple-splash-1290-2796.png', './apple-splash-1320-2868.png',
  './photos/po-252-2g.jpg', './photos/po-252-1g.jpg', './photos/pi-252-1g.jpg', './photos/bk-251-1g.jpg',
  './photos/vt-252g.jpg', './photos/bk-251-2-3g.jpg', './photos/et-251g.jpg', './photos/ps-262g.jpg',
  './photos/po-242-3g.jpg', './photos/po-242-1g.jpg', './photos/po-242-2g.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(ASSETS.map((a) => cache.add(a).catch(() => null)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isPage = event.request.mode === 'navigate' || event.request.url.endsWith('index.html') || event.request.url.endsWith('/');
  if (isPage) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
