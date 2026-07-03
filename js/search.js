/* ═══════════════════════════════════════════════════
   TOOLSNOVA — UNIFIED SEARCH + HOMEPAGE RENDERER  v3.0
   (data-driven, per HOMEPAGE_DESIGN_SPEC.md)

   Two responsibilities in one file (per Phase-4 deliverable
   scope: index.html, homepage.css, search.js only):

   1. SEARCH — loads and indexes:
        /data/tools.json
        /data/prompts.json
        /data/categories.json
        /data/collections.json
      Adding an entry to any of these JSON files makes it
      searchable automatically — no JS edits required.

   2. HOMEPAGE RENDER — populates the dynamic sections
      (Trending Tools, Browse Categories, AI Workspace,
      Recently Added, Popular Collections) from the same
      JSON files. Nothing about tools/categories/prompts/
      collections is hardcoded in index.html.
   ═══════════════════════════════════════════════════ */

'use strict';

(function () {

  /* ══════════════════════════════════════════════
     SHARED DATA CACHE
     ══════════════════════════════════════════════ */
  let DATA = { tools: null, prompts: null, categories: null, collections: null };
  let dataLoadedPromise = null;

  /* ── Read the embedded JSON fallback blocks (see index.html) ──
        fetch() is blocked by every modern browser under file://,
        even for relative paths — this is a browser security
        restriction, not something a path fix can work around.
        These embedded <script type="application/json"> blocks let
        tools/categories/collections still populate correctly when
        this page is opened directly (double-click) with no server.
        prompts.json (1.2MB) is intentionally not embedded — full
        prompt-title search requires fetch() / a real HTTP server. ── */
  function readEmbedded(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.warn('[TN] Failed to parse embedded data:', id, e);
      return null;
    }
  }

  async function loadAllData() {
    if (dataLoadedPromise) return dataLoadedPromise;
    dataLoadedPromise = (async () => {
      let fetchFailed = false;

      // fetch() is unconditionally blocked by every modern browser for
      // file:// URLs (a hard security restriction — confirmed even for
      // relative paths). Detecting this upfront means we skip straight
      // to the embedded-data fallback instead of letting the browser's
      // network layer log "Failed to load resource" / "URL scheme file
      // is not supported" to the console for requests we already know
      // will fail. Over real HTTP(S) — including localhost — fetch()
      // is attempted normally.
      if (location.protocol === 'file:') {
        fetchFailed = true;
      } else {
        try {
          const [toolsRes, promptsRes, catsRes, collRes] = await Promise.all([
            fetch('data/tools.json'),
            fetch('data/prompts.json'),
            fetch('data/categories.json'),
            fetch('data/collections.json'),
          ]);
          DATA.tools       = toolsRes.ok  ? await toolsRes.json()  : [];
          DATA.prompts     = promptsRes.ok ? await promptsRes.json() : [];
          DATA.categories  = catsRes.ok   ? await catsRes.json()   : [];
          DATA.collections = collRes.ok   ? await collRes.json()   : [];
        } catch (err) {
          fetchFailed = true;
          console.warn('[TN] fetch() failed, falling back to embedded data:', err.message);
        }
      }

      // Fall back to embedded JSON for any source that came back empty/failed.
      // This covers file:// testing and any environment where fetch is blocked.
      if (fetchFailed || !DATA.tools || !DATA.tools.length) {
        DATA.tools = readEmbedded('tn-embedded-tools') || [];
      }
      if (fetchFailed || !DATA.categories || !DATA.categories.length) {
        DATA.categories = readEmbedded('tn-embedded-categories') || [];
      }
      if (fetchFailed || !DATA.collections || !DATA.collections.length) {
        DATA.collections = readEmbedded('tn-embedded-collections') || [];
      }
      // prompts.json has no embedded fallback (too large) — degrade gracefully.
      DATA.prompts = DATA.prompts || [];

      return DATA;
    })();
    return dataLoadedPromise;
  }

  /* ══════════════════════════════════════════════
     SEARCH INDEX
     ══════════════════════════════════════════════ */
  let searchIndex = [];
  let indexBuilt   = false;
  let activeIdx    = -1;

  function categoryIcon(cat) {
    const icons = {
      writing:'✍️', marketing:'📣', business:'💼', coding:'💻',
      seo:'🔍', career:'🎯', trading:'📊', education:'🎓',
      social:'📱', productivity:'⚡', finance:'💰', image:'🖼️'
    };
    return icons[cat] || '📄';
  }
  function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function buildSearchIndex() {
    if (indexBuilt) return;
    const { tools, prompts, categories, collections } = DATA;

    const toolEntries = (tools || []).map(t => ({
      name: t.name, url: t.url, icon: t.icon || '🔧', cat: t.category || 'Tools',
      _keys: [t.name, t.category || '', t.desc || ''].join(' ').toLowerCase()
    }));

    const promptEntries = (prompts || []).map(p => ({
      name: p.title,
      url: `prompts/${(p.supported_models || ['chatgpt'])[0]}/${p.slug}.html`,
      icon: categoryIcon(p.category),
      cat: 'AI Prompts — ' + capitalise(p.category),
      _keys: [p.title, p.category, (p.tags || []).join(' ')].join(' ').toLowerCase()
    }));

    const categoryEntries = (categories || []).map(c => ({
      name: `${c.label} Prompts`, url: `prompts/${c.id}/index.html`,
      icon: c.emoji || '📄', cat: 'Prompt Category',
      _keys: [c.label, c.desc || '', 'category'].join(' ').toLowerCase()
    }));

    const collectionEntries = (collections || []).map(c => ({
      name: c.name, url: '#collection-' + c.id, icon: c.icon || '📦', cat: 'Collection',
      _keys: [c.name, c.desc || '', 'collection pack'].join(' ').toLowerCase()
    }));

    searchIndex = [...toolEntries, ...promptEntries, ...categoryEntries, ...collectionEntries];
    indexBuilt = true;
  }

  function matchEntry(entry, q) {
    const key = entry._keys || (entry.name + ' ' + entry.cat).toLowerCase();
    return key.includes(q);
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function highlight(text, q) {
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escHtml(text);
    return escHtml(text.slice(0, idx)) +
      '<mark style="background:var(--accent-dim);color:var(--accent);border-radius:2px;padding:0 1px">' +
      escHtml(text.slice(idx, idx + q.length)) + '</mark>' +
      escHtml(text.slice(idx + q.length));
  }

  function renderResults(results, q, container) {
    container.innerHTML = results.map((t, i) => `
      <div class="search-result-item" data-url="${escHtml(t.url)}" data-idx="${i}" role="option" tabindex="-1">
        <span class="result-icon" aria-hidden="true">${t.icon}</span>
        <div class="search-result-info">
          <div class="search-result-name">${highlight(t.name, q)}</div>
          <div class="search-result-cat">${escHtml(t.cat)}</div>
        </div>
        <span class="search-result-go" aria-hidden="true">Open →</span>
      </div>`).join('');

    container.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', function () {
        if (this.dataset.url.startsWith('#')) {
          document.querySelector(this.dataset.url)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = this.dataset.url;
        }
      });
      el.addEventListener('mouseenter', function () {
        activeIdx = parseInt(this.dataset.idx, 10);
        updateActive(container);
      });
    });
  }

  function updateActive(container) {
    container.querySelectorAll('.search-result-item').forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
      el.setAttribute('aria-selected', i === activeIdx ? 'true' : 'false');
    });
  }

  function navigateTo(q) {
    const lower = q.toLowerCase();
    const match = searchIndex.find(t => matchEntry(t, lower));
    if (match && !match.url.startsWith('#')) window.location.href = match.url;
  }

  function initSearch() {
    const input   = document.getElementById('v2-search');
    const results = document.getElementById('v2-search-results');
    if (!input || !results) return;

    input.addEventListener('focus', async () => { await loadAllData(); buildSearchIndex(); }, { once: true });

    input.addEventListener('input', async function () {
      const q = this.value.trim().toLowerCase();
      if (q.length < 2) { results.classList.remove('open'); activeIdx = -1; return; }
      await loadAllData();
      buildSearchIndex();
      const matches = searchIndex.filter(t => matchEntry(t, q)).slice(0, 9);
      if (!matches.length) { results.classList.remove('open'); return; }
      renderResults(matches, q, results);
      results.classList.add('open');
      activeIdx = -1;
    });

    input.addEventListener('keydown', function (e) {
      const items = results.querySelectorAll('.search-result-item');
      if (!items.length && e.key !== 'Enter') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); updateActive(results); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); updateActive(results); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && items[activeIdx]) window.location.href = items[activeIdx].dataset.url;
        else if (this.value.trim()) navigateTo(this.value);
        results.classList.remove('open');
      } else if (e.key === 'Escape') { results.classList.remove('open'); input.blur(); }
    });

    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !results.contains(e.target)) results.classList.remove('open');
    });
  }

  function initPopularTags() {
    document.querySelectorAll('.popular-tag').forEach(tag => {
      tag.addEventListener('click', async function () {
        const input = document.getElementById('v2-search');
        if (!input) return;
        input.value = this.dataset.query || this.textContent.trim();
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    });
  }

  function initSearchBtn() {
    const btn   = document.getElementById('v2-search-btn');
    const input = document.getElementById('v2-search');
    if (!btn || !input) return;
    btn.addEventListener('click', async () => {
      if (!input.value.trim()) return;
      await loadAllData();
      buildSearchIndex();
      navigateTo(input.value);
    });
  }

  /* ══════════════════════════════════════════════
     HOMEPAGE DYNAMIC RENDERING
     Per HOMEPAGE_DESIGN_SPEC.md — sections 4, 5, 6, 7, 8
     are built entirely from JSON. Zero hardcoded HTML.
     Phase 3.5: colored icon-badge treatment added to
     match the approved design reference image.
     ══════════════════════════════════════════════ */

  /* ── Category → badge colour map (used by Trending, Categories,
        Recently Added, Goal cards — keeps colours consistent) ── */
  const CATEGORY_COLOR = {
    'Developer': 'green', 'Trading': 'purple', 'Finance': 'cyan',
    'Utilities': 'blue', 'Converters': 'purple', 'Health': 'pink',
    'Students': 'blue', 'AI': 'orange', 'Construction': 'orange',
    'Math': 'blue', 'Prop Firm': 'yellow', 'Fun': 'pink',
  };
  function badgeColor(cat) { return CATEGORY_COLOR[cat] || 'green'; }

  const TOOL_CARD_TPL = t => `
    <a href="${escHtml(t.url)}" class="tool-card-v2">
      <div class="tool-card-icon icon-badge icon-badge-${badgeColor(t.category)}">${t.icon || '🔧'}</div>
      <div class="tool-card-name">${escHtml(t.name)}</div>
      <div class="tool-card-desc">${escHtml(t.desc || '')}</div>
      <div class="tool-card-cta">Open →</div>
    </a>`;

  const TOOL_CARD_NEW_TPL = t => `
    <a href="${escHtml(t.url)}" class="tool-card-v2">
      <span class="badge-new">NEW</span>
      <div class="tool-card-icon icon-badge icon-badge-${badgeColor(t.category)}">${t.icon || '🔧'}</div>
      <div class="tool-card-name">${escHtml(t.name)}</div>
      <div class="tool-card-desc">${escHtml(t.desc || '')}</div>
      <div class="tool-card-cta">Open →</div>
    </a>`;

  /* ── Section 4: Trending Tools (featured:true, source: tools.json) ── */
  function renderTrending(tools) {
    const el = document.getElementById('trending-tools-grid');
    if (!el) return;
    const trending = tools.filter(t => t.featured).slice(0, 12);
    el.innerHTML = trending.length
      ? trending.map(TOOL_CARD_TPL).join('')
      : '<p style="color:var(--text3);font-size:.85rem">No trending tools yet.</p>';
    el.classList.add('visible');
  }

  /* ── Section 5: Browse Categories (grouped from tools.json) ──
        NOTE: categories.json holds the AI-Prompt-Library category
        taxonomy (writing, seo, coding...), which is a different
        taxonomy from tool categories (Developer, Trading, Finance...).
        Repurposing categories.json here would corrupt the Prompt
        Library, which is explicitly protected ("DO NOT TOUCH:
        Generator, Prompt Pages"). Browse Categories is therefore
        derived from tools.json's own `category` field — still 100%
        dynamic, still zero hardcoded cards, just sourced from the
        JSON file that actually contains tool-category data. ── */
  const CATEGORY_META = {
    'Developer':    { icon: '{}', desc: 'JSON, regex, encoders, generators and dev utilities' },
    'Trading':      { icon: '📊', desc: 'Forex position sizing, risk management, pip calculators' },
    'Finance':      { icon: '$',  desc: 'Mortgages, loans, EMI, compound interest, invoices' },
    'Utilities':    { icon: '🛠️', desc: 'Everyday calculators, converters and generators' },
    'Converters':   { icon: '🔄', desc: 'Temperature, length, weight, speed, timezone' },
    'Health':       { icon: '❤️', desc: 'BMI, calories, TDEE, macros, sleep and fitness' },
    'Students':     { icon: '🎓', desc: 'GPA, grades, fractions, scientific calculators' },
    'AI':           { icon: '🤖', desc: 'Prompt library, prompt studio, token counters' },
    'Construction': { icon: '🏗️', desc: 'Concrete, paint, flooring, square footage' },
    'Math':         { icon: '📐', desc: 'Equations, matrices, standard deviation' },
    'Prop Firm':    { icon: '🏆', desc: 'Challenge tracking, drawdown, consistency' },
    'Fun':          { icon: '🎲', desc: 'Love calculator, dice roller, zodiac and more' },
  };

  /* ── Category → URL slug map (must match CATEGORY_SLUGS in
        pages_generator.py — kept in sync manually since one is
        Python and one is JS; see PAGES_GENERATOR.md) ── */
  const CATEGORY_PAGE_SLUGS = {
    'Developer': 'developer-tools', 'Finance': 'finance-tools', 'Trading': 'trading-tools',
    'Utilities': 'utilities', 'Health': 'health-tools', 'Students': 'student-tools',
    'Construction': 'construction-tools', 'Converters': 'converter-tools', 'AI': 'ai-tools',
    'Math': 'math-tools', 'Prop Firm': 'prop-firm-tools', 'Fun': 'fun-tools',
  };

  function renderCategories(tools) {
    const el = document.getElementById('browse-categories-grid');
    if (!el) return;
    const counts = {};
    tools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    const cats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    el.innerHTML = cats.map(cat => {
      const meta = CATEGORY_META[cat] || { icon: '📁', desc: 'Free browser-based tools' };
      const slug = CATEGORY_PAGE_SLUGS[cat];
      const href = slug ? `${slug}/index.html` : (tools.find(t => t.category === cat) || {}).url || '#';
      return `
        <a href="${escHtml(href)}" class="cat-card-v2">
          <div class="cat-card-icon icon-badge icon-badge-circle icon-badge-${badgeColor(cat)}">${meta.icon}</div>
          <div class="cat-card-name">${escHtml(cat)}</div>
          <div class="cat-card-count">${counts[cat]}+ tools</div>
        </a>`;
    }).join('');
    el.classList.add('visible');
  }

  /* ── Section 6: AI Workspace (flagship — filtered from tools.json where category === AI) ── */
  function renderAiWorkspace(tools) {
    const el = document.getElementById('ai-workspace-items');
    if (!el) return;
    const aiTools = tools.filter(t => t.category === 'AI');
    aiTools.sort((a, b) => (a.url.includes('prompt-library') ? -1 : 0) - (b.url.includes('prompt-library') ? -1 : 0));
    el.innerHTML = aiTools.map(t => `
      <a href="${escHtml(t.url)}" class="ai-workspace-item">
        <div class="icon-badge icon-badge-sm icon-badge-orange">${t.icon || '🤖'}</div>
        <div>
          <div class="ai-workspace-item-name">${escHtml(t.name)}</div>
          <div class="ai-workspace-item-desc">${escHtml((t.desc || '').split('.')[0])}</div>
        </div>
      </a>`).join('');
  }

  /* ── Section 7: Recently Added (sorted by dateAdded, source: tools.json) ── */
  function renderRecentlyAdded(tools) {
    const el = document.getElementById('recently-added-grid');
    if (!el) return;
    const sorted = [...tools].sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
    const recent = sorted.slice(0, 8);
    el.innerHTML = recent.map(TOOL_CARD_NEW_TPL).join('');
    el.classList.add('visible');
  }

  /* ── Section 8: Popular Collections (source: collections.json) —
        compact icon + name + count cards, matching design reference ── */
  const COLLECTION_ICONS = {
    'forex-trading': '📈', 'developer-starter': '{}', 'ai-power': '🤖',
    'student': '🎓', 'finance-home': '💰',
  };
  /* ── Collection id → URL slug map (must match COLLECTION_SLUGS in
        pages_generator.py — see PAGES_GENERATOR.md) ── */
  const COLLECTION_PAGE_SLUGS = {
    'forex-trading': 'forex-trading', 'developer-starter': 'developer-starter-pack',
    'ai-power': 'ai-power-pack', 'student': 'student-toolkit', 'finance-home': 'finance-home',
  };

  function renderCollections(collections, tools) {
    const el = document.getElementById('collections-grid');
    if (!el) return;
    el.innerHTML = collections.map((c, i) => {
      const colors = ['blue', 'purple', 'cyan', 'orange', 'pink', 'green'];
      const slug = COLLECTION_PAGE_SLUGS[c.id];
      const href = slug ? `collections/${slug}/index.html` : `#collection-${escHtml(c.id)}`;
      return `
        <a href="${escHtml(href)}" class="collection-card-compact">
          <div class="icon-badge icon-badge-circle icon-badge-${colors[i % colors.length]}">${c.icon || COLLECTION_ICONS[c.id] || '📦'}</div>
          <div class="collection-card-compact-name">${escHtml(c.name)}</div>
          <div class="collection-card-compact-count">${(c.tools || []).length} tools</div>
        </a>`;
    }).join('');
    el.classList.add('visible');
  }


  /* ── Stats bar (Section 3) — counts pulled live from data ──
        Only overwrite a stat's data-target when we have real data
        for it. prompts.json is not embedded (too large for the
        file:// fallback — see loadAllData()), so under file:// the
        prompts array can legitimately be empty; in that case we
        keep the honest hardcoded default already in the HTML
        (200+) rather than incorrectly showing "0+". ── */
  function renderStats(tools, prompts, categories) {
    const toolCountEl = document.querySelector('[data-stat="tools"]');
    const promptCountEl = document.querySelector('[data-stat="prompts"]');
    const catCountEl = document.querySelector('[data-stat="categories"]');
    if (toolCountEl && tools.length) toolCountEl.setAttribute('data-target', tools.length);
    if (promptCountEl && prompts.length) promptCountEl.setAttribute('data-target', prompts.length);
    if (catCountEl && categories.length) catCountEl.setAttribute('data-target', categories.length);
  }

  /* ── Orchestrate all dynamic rendering ── */
  async function renderHomepage() {
    // Only run on pages that actually have these dynamic containers
    if (!document.getElementById('trending-tools-grid') &&
        !document.getElementById('browse-categories-grid')) return;

    await loadAllData();
    const { tools, prompts, categories, collections } = DATA;

    renderStats(tools, prompts, categories);
    renderTrending(tools);
    renderCategories(tools);
    renderAiWorkspace(tools);
    renderRecentlyAdded(tools);
    renderCollections(collections, tools);

    // Re-init scroll-fade + counters for newly injected content
    if (window.initScrollFade) window.initScrollFade();
    document.querySelectorAll('[data-target]').forEach(el => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const duration = 1200;
      function tick(now) {
        const elapsed = Math.min(now - start, duration);
        const ease = 1 - Math.pow(1 - elapsed / duration, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (elapsed < duration) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ── Scroll-fade safety net ──
        js/utils.js (which normally drives .scroll-fade reveal via
        IntersectionObserver) is not yet wired into any page — see
        JS_MODULE_STRATEGY.md. Sections populated by renderHomepage()
        add `.visible` themselves once JSON loads, but STATIC
        scroll-fade content (e.g. Browse by Goal, which has no JSON
        source) would otherwise stay at opacity:0 forever. This
        observer catches any .scroll-fade element still missing
        `.visible` and reveals it on scroll-into-view, exactly like
        utils.js's initScrollFade() will once Phase 4 wires it in. ── */
  function initStaticScrollFade() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-fade:not(.visible)').forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.scroll-fade:not(.visible)').forEach(el => obs.observe(el));
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initPopularTags();
    initSearchBtn();
    renderHomepage();
    initStaticScrollFade();
  });

})();
