/* ================================================================
   ToolsNova Service Worker v7
   Strategy:
   - Pre-cache core assets + top 15 pages on install
   - Dynamically cache ALL other pages as user visits them
   - Network First for pages/JS/CSS (always fresh when online)
   - Cache First for images/fonts (never change)
   - Full offline support for any visited page
   ================================================================ */

const CACHE_NAME   = 'toolsnova-v7';
const ASSETS_CACHE = 'toolsnova-assets-v7';

// ── Pre-cache these on install (top traffic pages) ─────────────────
const PRE_CACHE_PAGES = [
  '/',
  '/json-formatter',
  '/forex-swap-calculator',
  '/prop-firm-challenge-calculator',
  '/monte-carlo-simulator',
  '/regex-tester',
  '/word-counter',
  '/age-calculator',
  '/bmi-calculator',
  '/percentage-calculator',
  '/password-generator',
  '/base64-encoder',
  '/qr-code-generator',
  '/timestamp-converter',
  '/uuid-generator',
  '/about',
  '/contact',
];

// ── Core assets always needed ──────────────────────────────────────
const CORE_ASSETS = [
  '/app.js?v=19',
  '/style.css?v=19',
  '/favicon.svg',
  '/manifest.json',
];

// ── INSTALL: pre-cache priority pages + core assets ────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache top pages — use individual try/catch so one failure
      // doesn't break the entire install
      caches.open(CACHE_NAME).then(async cache => {
        console.log('[SW v7] Pre-caching priority pages...');
        for (const page of PRE_CACHE_PAGES) {
          try {
            await cache.add(page);
          } catch(e) {
            console.warn('[SW v7] Failed to pre-cache:', page, e);
          }
        }
      }),
      // Cache core assets
      caches.open(ASSETS_CACHE).then(async cache => {
        for (const asset of CORE_ASSETS) {
          try {
            await cache.add(asset);
          } catch(e) {
            console.warn('[SW v7] Failed to cache asset:', asset, e);
          }
        }
      })
    ]).then(() => {
      console.log('[SW v7] Install complete');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: delete old caches ────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== ASSETS_CACHE)
            .map(k => {
              console.log('[SW v7] Deleting old cache:', k);
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

  // Skip cross-origin except Google Fonts
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(ASSETS_CACHE).then(cache =>
          cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
              if (res && res.ok) cache.put(event.request, res.clone());
              return res;
            }).catch(() => cached);
          })
        )
      );
    }
    return;
  }

  // ── Detect page requests (HTML or clean URLs) ──────────────────
  const isPage = url.pathname.endsWith('.html')
               || url.pathname === '/'
               || url.pathname === ''
               || (!url.pathname.includes('.') && url.pathname.length > 1);

  // ── Pages: Network First → cache on visit → serve offline ──────
  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          if (networkRes && networkRes.ok) {
            // Dynamically cache every page the user visits
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkRes.clone())
            );
          }
          return networkRes;
        })
        .catch(() => {
          // Offline — serve from cache (pre-cached or previously visited)
          return caches.match(event.request)
            .then(cached => {
              if (cached) return cached;
              // Try homepage as fallback
              return caches.match('/').then(home => {
                if (home) return home;
                // Last resort — friendly offline message
                return new Response(`
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>Offline — ToolsNova</title>
                    <style>
                      body { font-family: sans-serif; display: flex; flex-direction: column;
                             align-items: center; justify-content: center; min-height: 100vh;
                             margin: 0; background: #0c0c0e; color: #f0f0f2; text-align: center; padding: 2rem; }
                      h1 { color: #7fff6f; font-size: 2rem; margin-bottom: 0.5rem; }
                      p  { color: #aaa; max-width: 320px; line-height: 1.6; }
                      a  { color: #7fff6f; }
                    </style>
                  </head>
                  <body>
                    <h1>📡 You're Offline</h1>
                    <p>This page wasn't cached yet. Visit it once with internet to use it offline.</p>
                    <p>Pages you've already visited will work offline.</p>
                    <p><a href="/">← Go to Homepage</a></p>
                  </body>
                  </html>`,
                  { headers: { 'Content-Type': 'text/html; charset=utf-8' }}
                );
              });
            });
        })
    );
    return;
  }

  // ── JS and CSS: Network First → cache for offline ──────────────
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

  // ── Images/icons/fonts: Cache First ────────────────────────────
  if (url.pathname.match(/\.(svg|png|jpg|jpeg|ico|woff2?|gif|webp)$/)) {
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
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// ── MESSAGE ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
