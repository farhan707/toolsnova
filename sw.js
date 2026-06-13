/* ================================================================
   ToolsNova Service Worker v3
   - Caches .html pages correctly
   - Never intercepts /index.html (lets Cloudflare redirect handle it)
   ================================================================ */

const CACHE_NAME = 'toolsnova-v3';
const ASSETS_CACHE = 'toolsnova-assets-v3';

const CORE_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/favicon.svg',
  '/manifest.json',
];

// ── INSTALL ────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: delete ALL old caches ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== ASSETS_CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ──────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CRITICAL: Never intercept /index.html
  // Let Cloudflare Page Rule redirect it to /
  if (url.pathname === '/index.html') return;

  // Skip cross-origin (GA, CDN, etc.)
  if (url.origin !== self.location.origin) {
    // Cache Google Fonts
    if (url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.hostname === 'cdn.jsdelivr.net') {
      event.respondWith(
        caches.open(ASSETS_CACHE).then(cache =>
          cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
              if (res.ok) cache.put(event.request, res.clone());
              return res;
            }).catch(() => cached);
          })
        )
      );
    }
    return;
  }

  // Network first for HTML pages — always get fresh content
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          if (networkRes.ok) {
            const toCache = networkRes.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, toCache)
            );
          }
          return networkRes;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(networkRes => {
        if (networkRes && networkRes.ok) {
          const toCache = networkRes.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, toCache)
          );
        }
        return networkRes;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── MESSAGE ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
