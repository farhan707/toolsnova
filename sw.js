/* ================================================================
   ToolsNova Service Worker v7
   - PRE-CACHES all 137 pages + core assets on install
   - HTML: Network First → serves fresh when online, cached when offline
   - JS/CSS: Network First → always fresh, falls back to cache offline
   - Assets: Cache First → fonts/icons cached permanently
   - Clean URL support: /tool-name (not /tool-name.html)
   ================================================================ */

const CACHE_NAME    = 'toolsnova-v7';
const ASSETS_CACHE  = 'toolsnova-assets-v7';

// ── All 137 pages pre-cached on install for offline support ────────
const ALL_PAGES = [
  '/about',
  '/age-calculator',
  '/aspect-ratio-calculator',
  '/auto-loan-calculator',
  '/base64-encoder',
  '/blood-pressure-checker',
  '/blood-type-compatibility',
  '/bmi-calculator',
  '/body-fat-calculator',
  '/break-even-calculator',
  '/calorie-burn-calculator',
  '/calorie-calculator',
  '/case-converter',
  '/cgpa-calculator',
  '/challenge-pass-probability',
  '/character-counter',
  '/coin-flip-dice-roller',
  '/color-code-converter',
  '/color-picker',
  '/compound-interest-calculator',
  '/compound-trading-calculator',
  '/concrete-calculator',
  '/consistency-calculator',
  '/contact',
  '/cron-expression-builder',
  '/css-minifier',
  '/currency-converter',
  '/currency-correlation-calculator',
  '/daily-drawdown-calculator',
  '/data-size-converter',
  '/days-between-dates',
  '/diff-checker',
  '/discount-calculator',
  '/dividend-calculator',
  '/drawdown-calculator',
  '/electricity-cost-calculator',
  '/emi-calculator',
  '/fibonacci-calculator',
  '/flooring-calculator',
  '/forex-profit-calculator',
  '/forex-swap-calculator',
  '/fraction-calculator',
  '/fuel-cost-calculator',
  '/funded-account-roi-calculator',
  '/gold-position-size-calculator',
  '/gpa-calculator',
  '/grade-calculator',
  '/gst-calculator',
  '/hash-generator',
  '/height-converter',
  '/hex-binary-converter',
  '/html-encoder-decoder',
  '/ideal-weight-calculator',
  '/image-compressor',
  '/',
  '/inflation-calculator',
  '/invoice-generator',
  '/json-formatter',
  '/json-to-csv-converter',
  '/jwt-decoder',
  '/kelly-criterion-calculator',
  '/length-converter',
  '/leverage-calculator',
  '/lorem-ipsum',
  '/lot-size-calculator',
  '/love-calculator',
  '/lucky-number-generator',
  '/macro-calculator',
  '/margin-calculator',
  '/markdown-editor',
  '/matrix-calculator',
  '/meeting-time-zone-planner',
  '/monte-carlo-simulator',
  '/mortgage-calculator',
  '/net-worth-calculator',
  '/number-base-converter',
  '/number-to-words',
  '/ovulation-calculator',
  '/pace-calculator',
  '/paint-calculator',
  '/palworld-breeding-calculator',
  '/password-generator',
  '/password-strength-checker',
  '/percentage-calculator',
  '/percentage-error-calculator',
  '/pip-value-calculator',
  '/pivot-point-calculator',
  '/pomodoro-timer',
  '/position-scaling-calculator',
  '/pregnancy-due-date-calculator',
  '/privacy-policy',
  '/profit-target-tracker',
  '/prop-firm-challenge-calculator',
  '/qr-code-generator',
  '/quadratic-equation-solver',
  '/random-number-generator',
  '/random-word-generator',
  '/regex-tester',
  '/retirement-calculator',
  '/risk-of-ruin-calculator',
  '/risk-reward-calculator',
  '/roi-calculator',
  '/roman-numeral-converter',
  '/roof-pitch-calculator',
  '/salary-calculator',
  '/sales-tax-calculator',
  '/scientific-calculator',
  '/screen-resolution-calculator',
  '/significant-figures-calculator',
  '/sip-calculator',
  '/sleep-calculator',
  '/speed-converter',
  '/square-footage-calculator',
  '/standard-deviation-calculator',
  '/stop-loss-take-profit-calculator',
  '/stopwatch-timer',
  '/tdee-calculator',
  '/temperature-converter',
  '/terms',
  '/text-repeater',
  '/text-to-slug-converter',
  '/timestamp-converter',
  '/timezone-converter',
  '/tip-calculator',
  '/tip-split-calculator',
  '/triangle-calculator',
  '/typing-speed-test',
  '/url-encoder',
  '/uuid-generator',
  '/vat-calculator',
  '/vitamin-d-calculator',
  '/water-intake-calculator',
  '/weight-converter',
  '/win-rate-expectancy-calculator',
  '/word-counter',
  '/word-frequency-counter',
  '/zodiac-calculator'
];

// ── Core assets always needed ──────────────────────────────────────
const CORE_ASSETS = [
  '/app.js?v=19',
  '/style.css?v=19',
  '/favicon.svg',
  '/manifest.json',
];

// ── INSTALL: pre-cache everything ─────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache all pages
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW v7] Pre-caching all pages...');
        return cache.addAll(ALL_PAGES);
      }),
      // Cache core assets
      caches.open(ASSETS_CACHE).then(cache => {
        return cache.addAll(CORE_ASSETS);
      })
    ]).then(() => {
      console.log('[SW v7] All pages cached for offline use');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: delete old caches ───────────────────────────────────
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
              if (res.ok) cache.put(event.request, res.clone());
              return res;
            }).catch(() => cached);
          })
        )
      );
    }
    return;
  }

  // ── HTML pages & clean URLs: Network First ─────────────────────
  const isPage = url.pathname.endsWith('.html')
               || url.pathname === '/'
               || url.pathname === ''
               || (!url.pathname.includes('.') && url.pathname.length > 1);

  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          if (networkRes && networkRes.ok) {
            // Update cache with fresh version
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkRes.clone())
            );
          }
          return networkRes;
        })
        .catch(() => {
          // Offline — serve from cache
          return caches.match(event.request)
            .then(cached => cached || caches.match('/'))
            .then(cached => cached || new Response(
              '<h1>Offline</h1><p>Please connect to the internet to use ToolsNova.</p>',
              {headers: {'Content-Type': 'text/html'}}
            ));
        })
    );
    return;
  }

  // ── JS and CSS: Network First ──────────────────────────────────
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

  // ── Static assets: Cache First ─────────────────────────────────
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
