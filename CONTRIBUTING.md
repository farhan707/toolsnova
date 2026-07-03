# ToolsNova — Contributing Guide

> Read `ARCHITECTURE.md` first. This guide assumes you understand the project structure.

---

## 1. Getting Started

### Prerequisites

- A text editor (VS Code recommended)
- Python 3.9+ (for the prompt library generator and build scripts)
- Git
- A modern browser for testing

### Clone and run locally

```bash
git clone https://github.com/farhan707/toolsnova.git
cd toolsnova
```

No npm install. No build step. No dev server required. Open any `.html` file directly in your browser, or use VS Code's Live Server extension for auto-reload.

> **Note:** The service worker only registers on `toolsnova.net`. It will not run on `localhost` or `file://` URLs — this is intentional.

---

## 2. Types of Changes

### A. Adding a new tool page

**Step 1 — Create the HTML file**

Copy the structure from an existing simple tool (e.g. `age-calculator.html`). Every tool page must include:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<!-- Anti-flash: MUST be first in head -->
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("tn-theme")||"dark")</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{Tool Name} — Free Online Tool | ToolsNova</title>
<meta name="description" content="{160 char description. What it does, who it's for.}">
<link rel="canonical" href="https://toolsnova.net/{tool-name}.html">

<!-- Favicons + PWA -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
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
<meta property="og:title" content="{Tool Name} — Free Online Tool">
<meta property="og:description" content="{Same as meta description}">
<meta property="og:url" content="https://toolsnova.net/{tool-name}.html">
<meta property="og:type" content="website">
<meta property="og:image" content="https://toolsnova.net/icons/og-image.png">
<meta property="og:site_name" content="ToolsNova">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{Tool Name} — Free Online Tool">
<meta name="twitter:description" content="{Description}">
<meta name="twitter:image" content="https://toolsnova.net/icons/og-image.png">
<meta name="twitter:site" content="@toolsnova">

<!-- Schema: WebApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "{Tool Name}",
  "url": "https://toolsnova.net/{tool-name}.html",
  "description": "{Description}",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
</script>

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">

<!-- Styles -->
<link rel="stylesheet" href="style.css?v=20">

<!-- Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S6PPGS7N63"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-S6PPGS7N63');</script>

<!-- AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5507557143792193" crossorigin="anonymous"></script>
</head>
<body>
```

**Step 2 — Add the standard header**

```html
<header class="site-header">
  <a href="index.html" class="logo">Tools<span class="logo-dot">Nova</span></a>
  <nav class="site-nav" role="navigation" aria-label="Main">
    <span class="nav-category-label">Tools</span>
    <a href="index.html" class="nav-link">Home</a>
    <a href="ai-prompt-library.html" class="nav-link">AI Prompts</a>
    <div class="nav-divider" role="separator"></div>
    <span class="nav-category-label">Explore</span>
    <a href="json-formatter.html" class="nav-link">Developer</a>
    <a href="lot-size-calculator.html" class="nav-link">Trading</a>
    <a href="mortgage-calculator.html" class="nav-link">Finance</a>
    <a href="bmi-calculator.html" class="nav-link">Health</a>
  </nav>
  <button class="nav-toggle" onclick="navToggle()">Menu ☰</button>
</header>
```

**Step 3 — Add the tool body**

Use the shared CSS classes from `css/tools.css`. Prefer semantic HTML elements.

```html
<main>
  <div class="toolbar">
    <div class="page-hero">
      <h1>{Tool Name}</h1>
      <p>{One sentence description}</p>
    </div>
    <!-- Optional: status badge -->
    <span class="status-badge" id="status-badge">Ready</span>
  </div>

  <!-- Tool UI here -->
  <div class="split">
    <div>
      <div class="pane-label">Input</div>
      <textarea id="input" placeholder="Paste your content..." rows="12"></textarea>
    </div>
    <div>
      <div class="pane-label">Output</div>
      <div class="output-box" id="output"></div>
    </div>
  </div>

  <!-- Action buttons -->
  <div class="toolbar">
    <button class="btn primary" onclick="process()">Process</button>
    <button class="btn" onclick="copyEl('output')">Copy</button>
    <button class="btn danger" onclick="clear()">Clear</button>
  </div>
</main>
```

**Step 4 — Add the standard footer**

```html
<div id="toast" class="copy-toast"></div>

<footer class="site-footer">
  <span class="footer-copy">© 2026 ToolsNova</span>
  <nav class="footer-links" aria-label="Footer">
    <a href="privacy-policy.html">Privacy</a>
    <a href="terms.html">Terms</a>
    <a href="about.html">About</a>
    <a href="index.html">All Tools</a>
  </nav>
</footer>

<script src="app.js?v=20" defer></script>
<script>
/* ── Service Worker ── */
if('serviceWorker' in navigator && location.hostname === 'toolsnova.net') {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}

/* ── Tool logic ── */
function process() {
  const input = document.getElementById('input').value;
  // ... your tool logic
  document.getElementById('output').textContent = result;
}
</script>
</body>
</html>
```

**Step 5 — Add to data/tools.json**

```json
{
  "name": "{Tool Name}",
  "url": "{tool-name}.html",
  "icon": "{emoji}",
  "category": "{Developer|Finance|Trading|Utilities|Health|Converters|Students|Construction|Fun|Math|AI}",
  "desc": "{Short description under 100 chars}"
}
```

**Step 6 — Add to homepage**

Add a tool card in `index.html` in the appropriate category section:

```html
<a href="{tool-name}.html" class="tool-card-v2">
  <div class="tool-card-icon">{emoji}</div>
  <div class="tool-card-name">{Tool Name}</div>
  <div class="tool-card-desc">{Short description}</div>
  <div class="tool-card-cta">Open →</div>
</a>
```

---

### B. Modifying an existing tool

1. Find the tool's `.html` file
2. Edit only the tool-specific `<script>` block and HTML body
3. Do not change the `<head>`, header, or footer — they are standardised
4. Test in both dark and light mode
5. Test on mobile (Chrome DevTools responsive mode, minimum 320px width)

---

### C. Adding or editing CSS

**Rule: always edit the source file in `/css/`, never the built bundle in `dist/`.**

1. Identify the correct module (see `ARCHITECTURE.md` §5.2)
2. Edit that file only
3. If the change is new CSS that does not fit any existing module, discuss before creating a new module
4. Do not add tool-specific styles to a shared module (e.g. do not put `.json-formatter-grid` in `cards.css`)
5. All new CSS must use existing tokens from `css/tokens.css`

```css
/* ✅ Correct — uses tokens */
.my-component {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text2);
  transition: var(--transition);
}

/* ❌ Wrong — hardcodes values */
.my-component {
  background: #1c1c20;
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 14px;
  color: #9090a0;
  transition: 0.18s ease;
}
```

---

### D. Adding a new AI prompt

**Do not hand-write prompt pages.** All prompt pages are generated from `data/prompts.json` using `generator.py`.

**Step 1 — Add the prompt to prompts.json**

```json
{
  "id": 201,
  "slug": "my-new-prompt",
  "title": "My New Prompt",
  "category": "writing",
  "supported_models": ["chatgpt", "claude", "gemini"],
  "difficulty": "Beginner",
  "tags": ["tag1", "tag2"],
  "short_description": "Under 160 chars — what this prompt does.",
  "seo_title": "My New Prompt | ChatGPT | ToolsNova",
  "meta_description": "Under 155 chars for Google.",
  "prompt_text": "Your full prompt with [variable slots] here.",
  "variables": ["variable name"],
  "example_input": { "variable name": "example value" },
  "example_output": "What good output looks like.",
  "tips": ["Tip 1", "Tip 2"],
  "common_mistakes": ["Mistake 1"],
  "faqs": [{ "q": "Question?", "a": "Answer." }],
  "related_prompts": ["existing-slug-only"],
  "best_model": "claude",
  "last_updated": "2026-06-30",
  "featured": false
}
```

**Rules for prompts.json:**
- `id` must be the next sequential integer — no gaps, no duplicates
- `slug` must be unique, kebab-case, no special characters
- `related_prompts` must only reference slugs that already exist in the file
- `seo_title` must be under 65 characters including `| ToolsNova`
- `meta_description` must be under 155 characters

**Step 2 — Validate**

```bash
python3 build/validate_prompts.py
```

This checks: sequential IDs, unique slugs, no broken `related_prompts` references.

**Step 3 — Generate pages**

```bash
python3 generator.py
```

This rebuilds all affected pages. For a single new prompt:

```bash
python3 generator.py --prompt my-new-prompt
```

**Step 4 — Commit both the data and the generated pages**

```bash
git add data/prompts.json prompts/
git commit -m "feat: add My New Prompt to prompt library"
```

---

### E. Editing the homepage (index.html)

The homepage is `index.html`. It uses the V2 premium design.

**Rules:**
- Do not change the section order without discussing it first — it is SEO-tuned
- Do not add `style=""` inline CSS. Add a class and style it in `css/homepage.css` or `css/cards.css`
- Do not change the hero headline, stats section, or FAQ schema without a corresponding SEO review
- When adding a tool to a category showcase, add the tool card using the `.tool-card-v2` class — never the old `.tool-card` class (which is for tool pages only)

---

## 3. Code Standards

### HTML

- Use semantic elements: `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`
- Always include `role` and `aria-label` on interactive nav elements
- Every interactive element must be keyboard accessible
- No inline `style=""` attributes — use CSS classes

### CSS

- All values must use design tokens from `css/tokens.css`
- Never use `!important` except in `[data-theme="light"]` overrides where specificity requires it
- Mobile-first: write base styles for mobile, then add `@media (min-width: N)` for larger screens
- Transitions only on `opacity`, `transform`, `background-color`, `border-color`, `color` — never on `width`, `height`, or layout properties
- New CSS goes in the correct module file — see `ARCHITECTURE.md` §5.2

### JavaScript

- All new code is strict mode: add `'use strict';` at the top of every new JS file
- No `var` — use `const` or `let`
- No jQuery, no lodash, no external JS libraries
- Functions called from HTML attributes must be declared on `window` or at the top level
- New tool logic goes in its own `<script>` block at the bottom of the tool's HTML file
- Do not modify `app.js` — it is frozen pending Phase 4

### Naming conventions

| Thing | Convention | Example |
|---|---|---|
| HTML files | kebab-case | `json-formatter.html` |
| CSS classes | kebab-case | `.tool-card-v2` |
| JS functions | camelCase | `toggleTheme()` |
| JS variables | camelCase | `const inputEl = ...` |
| CSS custom properties | kebab-case with `--` prefix | `--accent-dim` |
| JSON keys | camelCase | `short_description` (snake_case — existing convention) |
| Prompt slugs | kebab-case | `seo-blog-post-writer` |

---

## 4. Testing Checklist

Before opening a pull request, verify every item:

### Visual

- [ ] Renders correctly in dark mode (default)
- [ ] Renders correctly in light mode (`[data-theme="light"]`)
- [ ] No layout breakage at 320px width (smallest mobile)
- [ ] No layout breakage at 768px (tablet)
- [ ] No layout breakage at 1440px (wide desktop)
- [ ] Theme toggle works (dark ↔ light, persists on reload)

### Functional

- [ ] All buttons and interactive elements respond correctly
- [ ] Copy button works and shows toast notification
- [ ] Keyboard navigation works (Tab through all interactive elements)
- [ ] Tool produces correct output for at least 3 different inputs
- [ ] Error states are handled gracefully (empty input, invalid input)

### SEO / Head

- [ ] `<title>` is unique and under 65 characters
- [ ] `<meta name="description">` is under 160 characters
- [ ] `<link rel="canonical">` points to the correct URL
- [ ] OG and Twitter meta tags are present and populated
- [ ] Schema markup is valid (test at schema.org/validator)
- [ ] Anti-flash script is the first element in `<head>`

### Performance

- [ ] Page loads without console errors
- [ ] No render-blocking scripts without `defer` or `async`
- [ ] Images (if any) have `loading="lazy"` and `alt` text
- [ ] No hardcoded pixel values in CSS (use tokens)

### Links

- [ ] Tool is added to `data/tools.json`
- [ ] Tool appears in homepage search results
- [ ] Internal links in the tool page point to real pages
- [ ] Related tools section (if present) links to existing pages

---

## 5. Git Workflow

### Branch naming

```
feat/{description}      ← New tool or feature
fix/{description}       ← Bug fix
style/{description}     ← CSS or visual change
docs/{description}      ← Documentation only
refactor/{description}  ← Restructuring without feature change
```

### Commit messages

Follow conventional commits:

```
feat: add Compound Interest Calculator
fix: correct EMI calculation for monthly input
style: update card hover state in dark mode
docs: update CONTRIBUTING.md testing checklist
refactor: extract tool functions to js/tools/
```

### Pull request rules

1. One PR per tool or change set
2. Include a screenshot of the tool in dark and light mode
3. All checklist items above must be verified
4. Do not include changes to unrelated files
5. `data/tools.json` must be updated in the same PR as the tool HTML

---

## 6. File Versioning

When modifying any CSS or JS file that is referenced by HTML with `?v=N`, the version number must be incremented in every HTML file that references it.

**Current version:** `v=20`

```bash
# Find all references to the current version
grep -r "?v=20" --include="*.html" .

# After incrementing all to v=21
grep -r "?v=21" --include="*.html" . | wc -l
# Should match the previous count
```

A version mismatch (e.g. `style.css?v=21` on the homepage but `style.css?v=20` on a tool page) causes users with cached old CSS to see broken styles.

---

## 7. Common Mistakes

### ❌ Adding inline styles

```html
<!-- Wrong -->
<div style="display:flex;gap:1rem;background:#1c1c20">

<!-- Right -->
<div class="toolbar">
```

### ❌ Hardcoding colours

```css
/* Wrong */
.my-thing { background: #1c1c20; color: #9090a0; }

/* Right */
.my-thing { background: var(--surface2); color: var(--text2); }
```

### ❌ Using `style-v2.css` or `script-v2.js`

These files no longer exist. All pages use `style.css` and `app.js`.

### ❌ Editing dist/ files

The `dist/` folder (Phase 5+) contains build output. It is regenerated on every deployment. Changes made there are overwritten.

### ❌ Hardcoding tools in search.js

The search index is built from `data/tools.json` at runtime. Do not add tool entries to `js/search.js` — update `data/tools.json` instead.

### ❌ Breaking related_prompts references

Every slug in a prompt's `related_prompts` array must exist in `prompts.json`. Run `python3 build/validate_prompts.py` before committing.

### ❌ Changing a published URL

Renaming `json-formatter.html` to `json-beautifier.html` destroys backlinks and SEO authority. If a URL must change, add a Cloudflare redirect rule **before** the old file is removed.

---

## 8. Quick Reference

### Design token cheat sheet

```css
/* Backgrounds */
var(--bg)          /* Page background: #0c0c0e / #f8f8f6 */
var(--surface)     /* Card background: #141416 / #ffffff */
var(--surface2)    /* Elevated: #1c1c20 / #f0f0ee */
var(--card)        /* Homepage cards: #13161D / #ffffff */

/* Text */
var(--text)        /* Primary: #f0f0f2 / #111112 */
var(--text2)       /* Secondary: #9090a0 / #555560 */
var(--text3)       /* Tertiary: #5a5a6a / #888894 */

/* Accent */
var(--accent)      /* Brand green: #7fff6f / #1a8a0a */
var(--accent-dim)  /* Accent background: rgba(127,255,111,0.12) */

/* Borders */
var(--border)      /* Default: rgba(255,255,255,0.07) */
var(--border2)     /* Strong: rgba(255,255,255,0.13) */

/* Radius */
var(--radius-sm)   /* 6px — buttons, chips */
var(--radius)      /* 10px — inputs, tool cards */
var(--radius-md)   /* 14px — homepage cards, search */
var(--radius-xl)   /* 28px — featured sections */
```

### Useful HTML patterns

```html
<!-- Status badge -->
<span class="status-badge" id="s">Ready</span>
<!-- Update via JS: setStatus('s', 'ok', 'Done ✓') or setStatus('s', 'err', 'Error') -->

<!-- Copy button -->
<button class="btn" onclick="copyEl('output')">Copy</button>
<!-- Requires: <div id="toast" class="copy-toast"></div> anywhere in body -->

<!-- Toggle group -->
<div class="toggle-group" role="group">
  <button class="toggle-btn active" onclick="setMode(this,'hex')">HEX</button>
  <button class="toggle-btn" onclick="setMode(this,'rgb')">RGB</button>
</div>

<!-- Split pane -->
<div class="split">
  <div><div class="pane-label">Input</div><textarea id="in"></textarea></div>
  <div><div class="pane-label">Output</div><div class="output-box" id="out"></div></div>
</div>
```

### Generator commands

```bash
python3 generator.py                     # Rebuild all 576 prompt pages
python3 generator.py --prompt {slug}     # Rebuild one prompt
python3 generator.py --category {cat}   # Rebuild one category
python3 generator.py --model {model}    # Rebuild one model hub
python3 generator.py --dry-run          # Count pages without writing
python3 generator.py --sitemap-only     # Regenerate sitemap only
```

---

## 9. Getting Help

- `ARCHITECTURE.md` — project structure, design system, SEO standards
- `CSS_DEPLOYMENT_STRATEGY.md` — how modular CSS becomes a production bundle
- `JS_MODULE_STRATEGY.md` — JS wiring plan and module dependency map
- `PROJECT_STATUS.md` — current phase and what is complete
- `CHANGELOG.md` — full history of every change made
- `TODO.md` — what comes next, phase by phase
