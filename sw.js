/* ================================================================
   ToolsNova Service Worker — PWA Offline Cache
   Version: 1.0
   ================================================================ */

const CACHE_NAME = 'toolsnova-v1';
const ASSETS_CACHE = 'toolsnova-assets-v1';

// Core files to cache immediately on install
const CORE_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/favicon.svg',
  '/manifest.json',
];

// All 100 tool pages
const TOOL_PAGES = [
  '/json-formatter',
  '/base64-encoder',
  '/word-counter',
  '/case-converter',
  '/password-generator',
  '/timestamp-converter',
  '/lorem-ipsum',
  '/url-encoder',
  '/uuid-generator',
  '/hash-generator',
  '/regex-tester',
  '/diff-checker',
  '/color-picker',
  '/number-to-words',
  '/text-repeater',
  '/random-number-generator',
  '/jwt-decoder',
  '/markdown-editor',
  '/json-to-csv-converter',
  '/html-encoder-decoder',
  '/hex-binary-converter',
  '/css-minifier',
  '/cron-expression-builder',
  '/text-to-slug-converter',
  '/number-base-converter',
  '/color-code-converter',
  '/password-strength-checker',
  '/age-calculator',
  '/bmi-calculator',
  '/percentage-calculator',
  '/qr-code-generator',
  '/image-compressor',
  '/typing-speed-test',
  '/pomodoro-timer',
  '/palworld-breeding-calculator',
  '/stopwatch-timer',
  '/aspect-ratio-calculator',
  '/character-counter',
  '/word-frequency-counter',
  '/random-word-generator',
  '/screen-resolution-calculator',
  '/sleep-calculator',
  '/love-calculator',
  '/lucky-number-generator',
  '/coin-flip-dice-roller',
  '/days-between-dates',
  '/zodiac-calculator',
  '/calorie-calculator',
  '/tdee-calculator',
  '/macro-calculator',
  '/ideal-weight-calculator',
  '/body-fat-calculator',
  '/water-intake-calculator',
  '/pace-calculator',
  '/fuel-cost-calculator',
  '/gpa-calculator',
  '/grade-calculator',
  '/fraction-calculator',
  '/scientific-calculator',
  '/percentage-error-calculator',
  '/roman-numeral-converter',
  '/emi-calculator',
  '/sip-calculator',
  '/compound-interest-calculator',
  '/gst-calculator',
  '/salary-calculator',
  '/vat-calculator',
  '/discount-calculator',
  '/tip-calculator',
  '/currency-converter',
  '/mortgage-calculator',
  '/auto-loan-calculator',
  '/retirement-calculator',
  '/net-worth-calculator',
  '/invoice-generator',
  '/sales-tax-calculator',
  '/temperature-converter',
  '/length-converter',
  '/weight-converter',
  '/speed-converter',
  '/data-size-converter',
  '/timezone-converter',
  '/lot-size-calculator',
  '/risk-reward-calculator',
  '/drawdown-calculator',
  '/margin-calculator',
  '/gold-position-size-calculator',
  '/pip-value-calculator',
  '/forex-profit-calculator',
  '/pivot-point-calculator',
  '/fibonacci-calculator',
  '/compound-trading-calculator',
  '/risk-of-ruin-calculator',
  '/leverage-calculator',
  '/stop-loss-take-profit-calculator',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
];

// ── INSTALL: cache core files immediately ──────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching core files');
      return cache.addAll(CORE_FILES);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== ASSETS_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => {
      console.log('[SW] Activated, old caches cleared');
      // Cache all tool pages in background after activation
      caches.open(CACHE_NAME).then(cache => {
        TOOL_PAGES.forEach(page => {
          fetch(page).then(res => {
            if (res.ok) cache.put(page, res);
          }).catch(() => {});
        });
      });
      return self.clients.claim();
    })
  );
});

// ── FETCH: serve from cache, fall back to network ─────────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (Google Analytics, fonts CDN, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    // For Google Fonts — cache them too
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(ASSETS_CACHE).then(cache =>
          cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
              cache.put(event.request, res.clone());
              return res;
            }).catch(() => cached);
          })
        )
      );
    }
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve from cache, update in background
        const fetchPromise = fetch(event.request).then(networkRes => {
          if (networkRes.ok) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkRes.clone())
            );
          }
          return networkRes;
        }).catch(() => {});
        return cached;
      }

      // Not in cache — fetch from network and cache it
      return fetch(event.request).then(networkRes => {
        if (!networkRes || !networkRes.ok || networkRes.type === 'opaque') {
          return networkRes;
        }
        const toCache = networkRes.clone();
        caches.open(CACHE_NAME).then(cache =>
          cache.put(event.request, toCache)
        );
        return networkRes;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ── MESSAGE: force update ──────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
