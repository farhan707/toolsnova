/* ================================================================
   ToolsNova Service Worker v5
   - HTML pages: Network First (always fresh)
   - JS/CSS: Network First (version numbers in URL handle cache)
   - Fonts/images: Cache First (never change)
   - Never intercepts /index.html
   ================================================================ */

const CACHE_NAME = 'toolsnova-v5';
const ASSETS_CACHE = 'toolsnova-assets-v5';

const CORE_ASSETS = [
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
              console.log('[SW v5] Deleting old cache:', k);
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
  if (url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      url.pathname === '') {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          if (networkRes && networkRes.ok) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkRes.clone())
            );
          }
          return networkRes;
        })
        .catch(() => caches.match(event.request)
          .then(cached => cached || caches.match('/')))
    );
    return;
  }

  // ── JS and CSS: NETWORK FIRST ──────────────────────────────────
  // Always fetch fresh JS/CSS — version query strings (?v=16) prevent
  // browser cache reuse, but SW cache could still serve old versions
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          if (networkRes && networkRes.ok) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkRes.clone())
            );
          }
          return networkRes;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ── Static assets (images, icons, fonts): CACHE FIRST ─────────
  if (url.pathname.match(/\.(svg|png|jpg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(networkRes => {
          if (networkRes && networkRes.ok) {
            caches.open(ASSETS_CACHE).then(cache =>
              cache.put(event.request, networkRes.clone())
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
