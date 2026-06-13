/* ================================================================
   ToolsNova Service Worker — PWA Offline Cache
   Version: 2.0 — Fixed index.html redirect issue
   ================================================================ */

const CACHE_NAME = 'toolsnova-v2';
const ASSETS_CACHE = 'toolsnova-assets-v2';

// Core files to cache immediately on install
const CORE_FILES = [
  '/',
  '/app.js',
  '/style.css',
  '/favicon.svg',
  '/manifest.json',
];

// All 100 tool pages — using .html extension to match actual files
const TOOL_PAGES = [
  '/json-formatter.html',
  '/base64-encoder.html',
  '/word-counter.html',
  '/case-converter.html',
  '/password-generator.html',
  '/timestamp-converter.html',
  '/lorem-ipsum.html',
  '/url-encoder.html',
  '/uuid-generator.html',
  '/hash-generator.html',
  '/regex-tester.html',
  '/diff-checker.html',
  '/color-picker.html',
  '/number-to-words.html',
  '/text-repeater.html',
  '/random-number-generator.html',
  '/jwt-decoder.html',
  '/markdown-editor.html',
  '/json-to-csv-converter.html',
  '/html-encoder-decoder.html',
  '/hex-binary-converter.html',
  '/css-minifier.html',
  '/cron-expression-builder.html',
  '/text-to-slug-converter.html',
  '/number-base-converter.html',
  '/color-code-converter.html',
  '/password-strength-checker.html',
  '/age-calculator.html',
  '/bmi-calculator.html',
  '/percentage-calculator.html',
  '/qr-code-generator.html',
  '/image-compressor.html',
  '/typing-speed-test.html',
  '/pomodoro-timer.html',
  '/palworld-breeding-calculator.html',
  '/stopwatch-timer.html',
  '/aspect-ratio-calculator.html',
  '/character-counter.html',
  '/word-frequency-counter.html',
  '/random-word-generator.html',
  '/screen-resolution-calculator.html',
  '/sleep-calculator.html',
  '/love-calculator.html',
  '/lucky-number-generator.html',
  '/coin-flip-dice-roller.html',
  '/days-between-dates.html',
  '/zodiac-calculator.html',
  '/calorie-calculator.html',
  '/tdee-calculator.html',
  '/macro-calculator.html',
  '/ideal-weight-calculator.html',
  '/body-fat-calculator.html',
  '/water-intake-calculator.html',
  '/pace-calculator.html',
  '/fuel-cost-calculator.html',
  '/gpa-calculator.html',
  '/grade-calculator.html',
  '/fraction-calculator.html',
  '/scientific-calculator.html',
  '/percentage-error-calculator.html',
  '/roman-numeral-converter.html',
  '/emi-calculator.html',
  '/sip-calculator.html',
  '/compound-interest-calculator.html',
  '/gst-calculator.html',
  '/salary-calculator.html',
  '/vat-calculator.html',
  '/discount-calculator.html',
  '/tip-calculator.html',
  '/currency-converter.html',
  '/mortgage-calculator.html',
  '/auto-loan-calculator.html',
  '/retirement-calculator.html',
  '/net-worth-calculator.html',
  '/invoice-generator.html',
  '/sales-tax-calculator.html',
  '/temperature-converter.html',
  '/length-converter.html',
  '/weight-converter.html',
  '/speed-converter.html',
  '/data-size-converter.html',
  '/timezone-converter.html',
  '/lot-size-calculator.html',
  '/risk-reward-calculator.html',
  '/drawdown-calculator.html',
  '/margin-calculator.html',
  '/gold-position-size-calculator.html',
  '/pip-value-calculator.html',
  '/forex-profit-calculator.html',
  '/pivot-point-calculator.html',
  '/fibonacci-calculator.html',
  '/compound-trading-calculator.html',
  '/risk-of-ruin-calculator.html',
  '/leverage-calculator.html',
  '/stop-loss-take-profit-calculator.html',
  '/about.html',
  '/contact.html',
  '/privacy-policy.html',
  '/terms.html',
];

// ── INSTALL ────────────────────────────────────────────────────────
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
            .map(k => {
              console.log('[SW] Deleting old cache:', k);
              return caches.delete(k);
            })
      )
    ).then(() => {
      console.log('[SW] Activated v2, old caches cleared');
      // Cache all tool pages in background
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

// ── FETCH ──────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CRITICAL FIX: Never intercept /index.html
  // Let it pass through to Cloudflare so the redirect works
  if (url.pathname === '/index.html') {
    return; // Do not intercept — let Cloudflare handle it
  }

  // Skip cross-origin except Google Fonts
  if (url.origin !== self.location.origin) {
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
        fetch(event.request).then(networkRes => {
          if (networkRes && networkRes.ok) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkRes.clone())
            );
          }
        }).catch(() => {});
        return cached;
      }

      // Not cached — fetch from network
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
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});

// ── MESSAGE ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
