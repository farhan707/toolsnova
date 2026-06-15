/* ================================================================
   ToolsNova Service Worker v4
   - HTML pages: Network First (always fresh)
   - Assets (JS/CSS/fonts): Cache First (fast loading)
   - Never intercepts /index.html (Cloudflare handles redirect)
   ================================================================ */

const CACHE_NAME = 'toolsnova-v4';
const ASSETS_CACHE = 'toolsnova-assets-v4';

// Only cache static assets on install — NOT HTML pages
const CORE_ASSETS = [
  '/app.js',
  '/style.css',
  '/favicon.svg',
  '/manifest.json',
];

// ── INSTALL ────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(ASSETS_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: delete ALL old caches ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== ASSETS_CACHE)
            .map(k => {
              console.log('[SW v4] Deleting old cache:', k);
              return caches.delete(k);
            })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ──────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CRITICAL: Never intercept /index.html
  if (url.pathname === '/index.html') return;

  // Skip cross-origin except Google Fonts
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(ASSETS_CACHE).then(cache =>
          cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
              if (res.ok) cache.put(event.request, res.clone());
              return res;
            });
          })
        )
      );
    }
    return;
  }

  // ── HTML pages: NETWORK FIRST ──────────────────────────────────
  // Always fetch fresh HTML — fall back to cache only if offline
  if (url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      url.pathname === '') {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          // Got fresh response — update cache and return
          if (networkRes && networkRes.ok) {
            const toCache = networkRes.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, toCache)
            );
          }
          return networkRes;
        })
        .catch(() => {
          // Offline — serve from cache
          return caches.match(event.request)
            .then(cached => cached || caches.match('/'));
        })
    );
    return;
  }

  // ── JS / CSS / fonts / images: CACHE FIRST ────────────────────
  // These have version numbers (?v=15) so cache is safe
  if (url.pathname.match(/\.(js|css|svg|png|jpg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(networkRes => {
          if (networkRes && networkRes.ok) {
            const toCache = networkRes.clone();
            caches.open(ASSETS_CACHE).then(cache =>
              cache.put(event.request, toCache)
            );
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // ── Everything else: Network with cache fallback ───────────────
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── MESSAGE ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
