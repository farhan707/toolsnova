# ToolsNova — Architecture Reference

> **Status:** Living document. Updated after every major phase.
> **Version:** V3 (Post Phase 1.5)
> **Last updated:** 2026-06-30

---

## 1. Project Overview

ToolsNova is a browser-based productivity platform serving 155+ free tools, 200 AI prompt templates, and a growing AI Workspace. It is a fully static website — no server-side rendering, no database, no runtime. Everything runs in the user's browser.

**Production URL:** https://toolsnova.net
**Hosting:** Cloudflare Pages (GitHub auto-deploy)
**Repository:** github.com/farhan707/toolsnova

### Scale targets

| Horizon | Tools | AI Prompts | Pages |
|---------|-------|------------|-------|
| Current | 147 | 200 | ~700 |
| Near-term | 200 | 500 | ~2,000 |
| Long-term | 500 | 1,000 | ~5,000 |

---

## 2. Technology Constraints

These are non-negotiable. All code must comply.

| Constraint | Reason |
|---|---|
| **Pure HTML, CSS, Vanilla JS only** | Cloudflare Pages static hosting; no build server |
| **No frameworks** (React, Vue, Bootstrap, Tailwind) | Bundle size, complexity, maintenance cost |
| **No npm, no Node runtime** | Static deployment only |
| **No server-side rendering** | Everything runs in the browser |
| **All tools run client-side** | Privacy-first: user data never leaves their device |
| **Python for build scripts only** | Generator and CSS concatenation |

---

## 3. Directory Structure

```
/                                   ← Site root (deploys to toolsnova.net/)
│
├── index.html                      ← Homepage (premium V2 design)
├── ai-prompt-library.html          ← AI Prompt Library hub
├── {tool-name}.html                ← Individual tool pages (155+ files)
├── favicon.svg                     ← Primary favicon
├── manifest.json                   ← PWA manifest
├── sw.js                           ← Service worker (offline PWA)
├── robots.txt                      ← Crawler directives
├── sitemap.xml                     ← Main sitemap (tools + static pages)
├── sitemap-prompts.xml             ← Prompt library sitemap (577 URLs)
│
├── style.css                       ← Master CSS entry point (@imports all modules)
├── app.js                          ← Master JS (all tool functions, 6,734 lines)
│
├── css/                            ← Modular CSS source files
│   ├── tokens.css                  ← Design tokens (variables, reset, base HTML)
│   ├── header.css                  ← Navigation, mobile nav
│   ├── footer.css                  ← Simple + premium footer variants
│   ├── cards.css                   ← All card types (tool, category, stat, etc.)
│   ├── search.css                  ← Search bar, autocomplete, pills
│   ├── tools.css                   ← Tool page layout, buttons, inputs, outputs
│   ├── homepage.css                ← Homepage-only sections and animations
│   ├── prompt-library.css          ← Prompt library hub and prompt page styles
│   └── tool-components.css         ← Tool-specific UI (JSON colours, diff, etc.)
│
├── js/                             ← JavaScript modules
│   ├── search.js                   ← ACTIVE: data-driven unified search
│   ├── theme.js                    ← Reference: theme toggle (Phase 4)
│   ├── navigation.js               ← Reference: nav toggle (Phase 4)
│   ├── utils.js                    ← Reference: shared utilities (Phase 4)
│   └── app-header.js               ← Architecture documentation only
│
├── data/                           ← Structured data (JSON)
│   ├── tools.json                  ← Master tool index (147 tools)
│   ├── prompts.json                ← All 200 AI prompts
│   ├── categories.json             ← Category definitions
│   ├── collections.json            ← Curated tool collections
│   └── models.json                 ← AI model definitions
│
├── components/                     ← HTML component reference templates
│   ├── tool-card.html
│   ├── prompt-card.html
│   └── breadcrumb.html
│
├── prompts/                        ← AI Prompt Library (generated, 576 pages)
│   ├── chatgpt/{slug}.html         ← 200 ChatGPT prompt pages
│   ├── claude/{slug}.html          ← 199 Claude prompt pages
│   ├── gemini/{slug}.html          ← 137 Gemini prompt pages
│   ├── deepseek/{slug}.html        ← 22 DeepSeek prompt pages
│   ├── grok/{slug}.html            ← 1 Grok prompt page
│   ├── chatgpt/index.html          ← ChatGPT model hub
│   ├── {category}/index.html       ← 12 category hubs
│   └── ... (576 HTML files total)
│
├── generator.py                    ← Prompt library static site generator
├── build/
│   └── concat_css.py               ← CSS build script (Phase 5 deployment)
│
├── icons/                          ← PWA icons and favicons
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── icon-192.png
│   ├── icon-512.png
│   └── og-image.png                ← 1200×630 for OG/Twitter cards
│
└── docs/                           ← Developer documentation
    ├── ARCHITECTURE.md             ← This file
    ├── CONTRIBUTING.md
    ├── CSS_DEPLOYMENT_STRATEGY.md
    └── JS_MODULE_STRATEGY.md
```

---

## 4. Design System

All visual values are defined once in `css/tokens.css` and referenced everywhere via CSS custom properties.

### 4.1 Colour Tokens

#### Dark mode (default)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0c0c0e` | Page background |
| `--bg2` | `#0f1117` | Alternate background (footer, stats) |
| `--surface` | `#141416` | Card backgrounds (tool pages) |
| `--surface2` | `#1c1c20` | Elevated surfaces, inputs |
| `--surface3` | `#242428` | Hovered surfaces |
| `--card` | `#13161D` | Homepage V2 cards |
| `--card2` | `#181c26` | Hovered homepage cards |
| `--border` | `rgba(255,255,255,0.07)` | Default borders |
| `--border2` | `rgba(255,255,255,0.13)` | Stronger borders, inputs |
| `--text` | `#f0f0f2` | Primary text |
| `--text2` | `#9090a0` | Secondary text, descriptions |
| `--text3` | `#5a5a6a` | Tertiary text, labels, placeholders |
| `--accent` | `#7fff6f` | Brand green — CTAs, highlights, links |
| `--accent-dim` | `rgba(127,255,111,0.12)` | Accent backgrounds, hover states |
| `--accent-glow` | `rgba(127,255,111,0.20)` | Accent shadows, borders |
| `--red` | `#ff6b6b` | Errors, destructive actions |
| `--purple` | `#9b7fff` | Alternate accent (unused currently) |

#### Light mode overrides (`[data-theme="light"]`)

| Token | Value |
|---|---|
| `--bg` | `#f8f8f6` |
| `--surface` | `#ffffff` |
| `--text` | `#111112` |
| `--accent` | `#1a8a0a` |

### 4.2 Typography

Three font stacks are available. Use them as specified — do not mix.

| Token | Stack | Usage |
|---|---|---|
| `--mono` | `'IBM Plex Mono', monospace` | Navigation links, labels, badges, code, tool UI |
| `--display` | `'Syne', sans-serif` | Headings (tool pages, all `<h1>`–`<h3>`) |
| `--sans` | `'Inter', 'Plus Jakarta Sans', system-ui` | Homepage hero, buttons, body paragraphs |

**Rule:** Homepage uses `--sans` for body text. Tool pages use `--mono` for body text. Headings everywhere use `--display`.

### 4.3 Spacing and Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Buttons, small chips |
| `--radius` | `10px` | Tool cards (production), inputs |
| `--radius-md` | `14px` | Homepage V2 cards, search bar |
| `--radius-lg` | `20px` | Large containers |
| `--radius-xl` | `28px` | Featured section, hero cards |

### 4.4 Shadows

```css
--shadow-card:  0 1px 3px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.3);
--shadow-hover: 0 2px 8px rgba(0,0,0,.5), 0 8px 32px rgba(0,0,0,.4);
```

Apply `var(--shadow-card)` at rest, `var(--shadow-hover)` on `:hover`.

### 4.5 Animation

```css
--transition: 0.18s cubic-bezier(0.4, 0, 0.2, 1);
```

All interactive elements use this transition. Do not use `transition: all` on layout-affecting properties (causes jank).

---

## 5. CSS Architecture

### 5.1 Loading strategy

CSS is split into 9 source modules for maintainability. Each serves a specific domain.

```
style.css (entry)
  @import css/tokens.css          ← Must be first
  @import css/header.css
  @import css/footer.css
  @import css/cards.css
  @import css/search.css
  @import css/tools.css
  @import css/tool-components.css
```

Homepage additionally loads:
```html
<link rel="stylesheet" href="css/homepage.css?v=20">
```

Prompt pages use the same `style.css` entry — they do not load `homepage.css`.

### 5.2 Module responsibilities

| File | Owns |
|---|---|
| `tokens.css` | All CSS custom properties, reset, `body` base styles, scrollbar |
| `header.css` | `.site-header`, `.logo`, `.site-nav`, `.nav-link`, mobile nav |
| `footer.css` | `.site-footer` (simple), `.v2-footer` + `.footer-grid-lg` (premium) |
| `cards.css` | `.tool-card`, `.tool-card-v2`, `.cat-card-v2`, `.stat-card`, `.why-card`, `.collection-card`, `.goal-card`, `.related-card` |
| `search.css` | `.hero-search`, `.hero-search-results`, `.popular-tag`, `.search-tag-pill` |
| `tools.css` | `.main`, `.toolbar`, `.btn`, `.split`, `textarea`, `.output-box`, `.status-badge`, `.toggle-group`, `.theme-toggle-fab`, `.copy-toast` |
| `homepage.css` | `.v2-nav`, `.v2-hero`, `.v2-section`, `.v2-featured`, `.faq-*` (V2 aria style), `.v2-newsletter`, scroll animations |
| `prompt-library.css` | `.hub-hero`, `.prompt-card`, `.prompt-page`, `.breadcrumb`, `.badge-*`, `.prompt-box`, `.tips-list`, `.mistakes-list` |
| `tool-components.css` | JSON syntax colours `.jk/.js/.jn`, `.freq-*` bars, `.diff-*`, `.cp-*` color picker, `.md-preview`, `.edu-*`, `.sci-*` |

### 5.3 Production deployment

In production, `@import` chains are replaced with a single concatenated bundle per page type. See `CSS_DEPLOYMENT_STRATEGY.md` for the full strategy and `build/concat_css.py` for the build script.

**Rule:** Never edit files in `dist/`. Always edit source files in `css/`.

### 5.4 Do not cross module boundaries

Each CSS module must only define what it owns. If you find yourself adding `.tool-card` styles to `homepage.css`, that is a bug — the styles belong in `cards.css`.

---

## 6. JavaScript Architecture

### 6.1 Current loading pattern

```html
<!-- All pages -->
<script src="app.js?v=20" defer></script>

<!-- Homepage only -->
<script src="js/search.js?v=20" defer></script>
```

### 6.2 app.js — the production monolith

`app.js` (6,734 lines, 324 KB) contains all tool functions as global functions callable from HTML. It is loaded with `defer` on every page.

**Contents:**
- Theme system (`toggleTheme`, `_updateToggleIcon`)
- Shared utilities (`showToast`, `copyEl`, `setStatus`, `navToggle`)
- 100+ tool-specific functions (`jsonFormat`, `base64Encode`, `calcEmi`, `calcLotSize`, etc.)

**Rule:** Do not add new global functions to `app.js`. New functionality goes in `/js/` modules. `app.js` is frozen pending the Phase 4 refactor.

### 6.3 js/search.js — the active module

The only wired JS module. Loaded on the homepage via `<script defer>`.

**Behaviour:**
1. Pre-loads the search index on first `focus` event on the search input
2. Fetches `/data/tools.json` and `/data/prompts.json` in parallel
3. Builds a combined search index (tools + all 200 prompt titles + 12 prompt category hubs)
4. Renders autocomplete results with keyboard navigation (↑ ↓ Enter Escape)
5. Highlights matching text in result names

**Key rule:** Never hardcode tool entries in `search.js`. All tools come from `data/tools.json`.

### 6.4 Planned modules (Phase 4)

These files exist as reference implementations and are clearly marked `NOT YET LOADED`:

| File | Status | Contents |
|---|---|---|
| `js/theme.js` | Reference only | Theme toggle, extracted from app.js |
| `js/navigation.js` | Reference only | Mobile nav toggle |
| `js/utils.js` | Reference only | Toast, FAQ, counters, SW, back-to-top |

See `JS_MODULE_STRATEGY.md` for the full wiring plan and dependency map.

---

## 7. Data Layer

All data is stored as static JSON files in `/data/`. No database, no API.

### 7.1 tools.json

The authoritative source for the search index and any future tool listing pages.

```json
{
  "name": "JSON Formatter",
  "url": "json-formatter.html",
  "icon": "{}",
  "category": "Developer",
  "desc": "Format, validate and beautify JSON with syntax highlighting"
}
```

**Rule:** When a new tool page is created, its entry must be added to `tools.json` at the same time. The search system is data-driven — a tool not in `tools.json` will not appear in search.

### 7.2 prompts.json

Contains all 200 AI prompts. Generated by `generator.py`. Each prompt has:

```json
{
  "id": 1,
  "slug": "seo-blog-post-writer",
  "title": "SEO Blog Post Writer",
  "category": "writing",
  "supported_models": ["chatgpt", "claude", "gemini"],
  "difficulty": "Intermediate",
  "tags": [...],
  "short_description": "...",
  "prompt_text": "...",
  "variables": [...],
  "example_input": {...},
  "example_output": "...",
  "tips": [...],
  "common_mistakes": [...],
  "faqs": [...],
  "related_prompts": [...],
  "best_model": "claude",
  "last_updated": "2026-06-29",
  "featured": false
}
```

**Rule:** `related_prompts` must only reference slugs that exist in `prompts.json`. Run the validation check before committing: `python3 build/validate_prompts.py`.

### 7.3 categories.json / models.json / collections.json

Supporting data for category and model hub pages, and the curated collections shown on the homepage.

---

## 8. Prompt Library System

The AI Prompt Library is a static site generated from `prompts.json` using `generator.py`.

### 8.1 Generator

```bash
python3 generator.py                    # Build all pages
python3 generator.py --prompt slug      # Rebuild one prompt
python3 generator.py --model chatgpt    # Rebuild one model hub
python3 generator.py --category seo     # Rebuild one category hub
python3 generator.py --dry-run          # Count pages only
python3 generator.py --sitemap-only     # Regenerate sitemap only
```

### 8.2 Page structure (per prompt)

For each prompt, one page is generated per supported model:

```
prompts/chatgpt/{slug}.html
prompts/claude/{slug}.html
prompts/gemini/{slug}.html
```

Plus category and model hub pages:

```
prompts/{category}/index.html      (12 pages)
prompts/{model}/index.html         (5 pages)
ai-prompt-library.html             (1 page)
```

**Total:** 576 HTML files + 1 hub = 577 pages.

### 8.3 Asset references in prompt pages

All prompt pages reference assets from the site root using absolute paths:

```html
<link rel="stylesheet" href="/style.css?v=20">
<script src="/app.js?v=20" defer></script>
```

**Rule:** Prompt pages must never reference `/css/homepage.css` — they do not use homepage styles.

---

## 9. Theme System

### 9.1 Anti-flash script

Every page must have this as the **first** element inside `<head>` — before any CSS link:

```html
<script>
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("tn-theme") || "dark"
  )
</script>
```

This reads the user's saved preference before the browser paints, eliminating flash of wrong theme.

### 9.2 Theme storage

Stored in `localStorage` under the key `tn-theme`. Values: `"dark"` (default) or `"light"`.

### 9.3 CSS targeting

All light mode overrides use `[data-theme="light"]`:

```css
[data-theme="light"] .tool-card {
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
```

Do not use `@media (prefers-color-scheme)` for overrides — we control the theme via `data-theme`, not OS preference.

### 9.4 Toggle function

```js
function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark"
    ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tn-theme", next);
}
```

---

## 10. SEO Standards

Every page must include the following in `<head>`:

### 10.1 Required for all pages

```html
<!-- Anti-flash (first in head) -->
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("tn-theme")||"dark")</script>

<!-- Core meta -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{Page Title} | ToolsNova</title>
<meta name="description" content="{160 char description}">
<link rel="canonical" href="https://toolsnova.net/{path}">

<!-- PWA -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#7fff6f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ToolsNova">

<!-- Open Graph -->
<meta property="og:title" content="{Title}">
<meta property="og:description" content="{Description}">
<meta property="og:url" content="https://toolsnova.net/{path}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://toolsnova.net/icons/og-image.png">
<meta property="og:site_name" content="ToolsNova">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{Title}">
<meta name="twitter:description" content="{Description}">
<meta name="twitter:image" content="https://toolsnova.net/icons/og-image.png">
<meta name="twitter:site" content="@toolsnova">
```

### 10.2 Schema markup

**Homepage:** `WebSite` + `SearchAction` + `FAQPage`
**Tool pages:** `WebApplication`
**Prompt pages:** `CreativeWork`
**All pages with breadcrumbs:** `BreadcrumbList`

### 10.3 Tracking

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S6PPGS7N63"></script>
<script>
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  gtag('js',new Date());
  gtag('config','G-S6PPGS7N63');
</script>

<!-- AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5507557143792193" crossorigin="anonymous"></script>
```

**Rule:** GA and AdSense must appear in the `<head>`. They must never be deferred.

---

## 11. PWA and Service Worker

ToolsNova is installable as a Progressive Web App. The service worker (`sw.js`) caches static assets for offline use.

Service worker registration must appear in every page, at the bottom of `<body>`:

```html
<script>
if('serviceWorker' in navigator && location.hostname === 'toolsnova.net') {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(r) { console.log('[TN] SW:', r.scope); })
      .catch(function(e) { console.log('[TN] SW fail:', e); });
  });
}
</script>
```

**Rule:** The `location.hostname` check ensures the SW only registers on production, not `localhost` or preview deployments.

---

## 12. Asset Versioning

All CSS and JS files are versioned with a query string:

```html
<link rel="stylesheet" href="style.css?v=20">
<script src="app.js?v=20" defer></script>
```

**Current version:** `v=20`

When any CSS or JS file is modified, increment the version number across all HTML files before deploying. This busts Cloudflare's edge cache.

**Rule:** Version must be the same across all files in a deployment. Do not use `v=20` for style.css and `v=19` for app.js.

---

## 13. URL Conventions

| Page type | URL pattern |
|---|---|
| Homepage | `toolsnova.net/` |
| Tool page | `toolsnova.net/{tool-name}.html` |
| Prompt page | `toolsnova.net/prompts/{model}/{slug}.html` |
| Prompt category hub | `toolsnova.net/prompts/{category}/index.html` |
| Prompt model hub | `toolsnova.net/prompts/{model}/index.html` |
| Prompt Library hub | `toolsnova.net/ai-prompt-library.html` |

**Rule:** Never rename an existing URL without adding a Cloudflare redirect rule. URL changes destroy SEO authority and break external links.

---

## 14. Deployment

### 14.1 Normal deployment (code changes only)

```bash
git add -A
git commit -m "feat: description of change"
git push origin main
```

Cloudflare Pages detects the push and deploys automatically. Deployment takes ~30 seconds.

### 14.2 Deployment with prompt library changes

After modifying `data/prompts.json`:

```bash
python3 generator.py        # Rebuild all prompt pages
git add -A
git commit -m "feat: prompt library update"
git push origin main
```

### 14.3 Deployment with CSS changes (Phase 5+)

After modifying any file in `css/`:

```bash
python3 build/concat_css.py  # Rebuild dist/ bundles
# Increment version number in all HTML files
git add -A
git commit -m "style: CSS update"
git push origin main
```

### 14.4 Cloudflare configuration

- Build command: none (static files only)
- Build output directory: `/`
- Root: repository root
- Redirect rules: `www.toolsnova.net` → `toolsnova.net` (301), `.html` URLs → clean URLs (301)

---

## 15. Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Complete | Architecture restructuring — CSS modules, JS modules, data files |
| Phase 1.5 | ✅ Complete | Architecture corrections — SW, favicons, Twitter, data-driven search |
| Phase 2 | 🔜 Next | Homepage V2 integration — update all tool page headers |
| Phase 3 | Planned | Prompt Library integration — unified nav, updated page headers |
| Phase 4 | Planned | JS modularization — wire /js/ modules, extract tool functions |
| Phase 5 | Planned | SEO + CSS build pipeline — schema, sitemaps, concat_css.py |
| Phase 6+ | Future | Performance, PWA enhancements, collections page |
