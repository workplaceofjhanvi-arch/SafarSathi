const CACHE = 'safarsathi-v6';
const FILES = ['/', '/index.html', '/style.css', '/app.js'];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'tile.openstreetmap.org'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FILES)).then(() =>
      caches.open(CACHE).then((c) => Promise.all([
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
        'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'
      ].map((u) => c.add(u).catch(() => {}))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Map library and map tiles: cache first, save new ones as they load
  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit ||
        fetch(e.request).then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return r;
        }))
    );
    return;
  }

  if (url.origin !== location.origin || url.pathname.startsWith('/api')) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() =>
        caches.match(e.request).then((hit) =>
          hit || (e.request.mode === 'navigate' ? caches.match('/index.html') : undefined)))
  );
});