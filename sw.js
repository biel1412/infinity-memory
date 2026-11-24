/* Infinity Memory — funciona offline */
const CACHE = 'infinity-v2';
const SHELL = ['./', './index.html', './css/app.css', './js/db.js', './js/srs.js', './js/highlight.js', './js/app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const cacheable = url.origin === location.origin || url.hostname.includes('fonts.g');
  e.respondWith(fetch(e.request).then((res) => {
    if (res.ok && cacheable) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
