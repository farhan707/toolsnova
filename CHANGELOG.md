# ToolsNova — Changelog

## Phase 1 — Architecture Restructuring (2026-06-30)

### ✅ Created

#### CSS Modules (`/css/`)
- `tokens.css` — Merged design tokens from `style.css` (production) and `style-v2.css` (V2), production takes precedence. Single source of truth for all CSS variables.
- `header.css` — Site header, navigation, mobile nav, page hero
- `footer.css` — Simple footer (tool pages) + premium expanded footer (homepage)
- `cards.css` — All card types: tool cards (v1 + v2), category cards, stat cards, why cards, collection cards, goal cards, related tool cards
- `search.css` — Hero search bar, autocomplete dropdown, popular tags, SEO search pills
- `homepage.css` — Homepage-only sections: V2 nav, hero, stats, sections, AI workspace, FAQ (V2), newsletter, animations, responsive
- `tools.css` — Tool page UI: toolbar, buttons, split pane, inputs, outputs, status badge, toggle groups, theme FAB, ad slot
- `prompt-library.css` — Prompt library hub and individual prompt page styles, badges
- `tool-components.css` — Tool-specific UI: JSON syntax highlighting, word frequency bars, regex, diff checker, color picker, markdown preview, educational sections, scientific calculator

#### JS Modules (`/js/`)
- `theme.js` — Extracted theme toggle from `app.js`, works on both tool pages and V2 nav
- `navigation.js` — Mobile nav toggle for both tool pages (`navToggle`) and homepage V2 (`tnNavToggle`)
- `search.js` — Unified search index: all 80+ tools + 12 prompt categories. Autocomplete with keyboard navigation
- `utils.js` — Toast, copyEl, setStatus, FAQ accordion (both production and V2 styles), scroll-fade, stat counters, back-to-top, newsletter form, service worker

#### Data Files (`/data/`)
- `tools.json` — Tool index for search and listing
- `collections.json` — 5 curated tool collections
- Copied from promptlib: `prompts.json`, `categories.json`, `models.json`

#### Root Files
- `style.css` — Master CSS entry point using `@import` for all modules
- `app.js` — Production app.js (100% unchanged tool logic, version bumped to v20)
- `index.html` — Homepage: V2 design with corrected resource references (`style-v2.css` → `style.css`, `script-v2.js` → `app.js` + `js/search.js`)

#### Components (`/components/`)
- `breadcrumb.html` — Reference template
- `tool-card.html` — Reference template
- `prompt-card.html` — Reference template

### ✅ Preserved (zero changes)
- All 155+ tool page HTML files (not in this package — unchanged on GitHub)
- All tool function logic in `app.js` (lines 62–6734)
- All existing URLs
- All SEO metadata
- All prompt pages (576 HTML files)
- AI Prompt Library hub (`ai-prompt-library.html`)

### ❌ Eliminated
- `style-v2.css` — Extracted and distributed into 9 modular CSS files
- `script-v2.js` — Logic distributed into `/js/` modules
- `index-v2.html` — Merged into `index.html` (production homepage)
- CSS duplication between V2 and production (tokens merged, duplicates removed)

---

## Previous Work (Pre-Phase 1)

### 2026-06-30 — Prompt Library Complete
- 200 AI prompts generated (IDs 1-200)
- 576 HTML pages built
- Homepage integrated with 13 links to AI Prompt Library

### 2026-06-29 — Prompt Library Started
- Generator built (845 lines)
- Batches 001-003 generated (149 prompts)
- Homepage V2 built with premium SaaS design

### 2026-06-27 — Homepage V2
- Premium homepage redesign (index-v2.html)
- 12 trending tools, 10 category cards, 9 category showcases
- Popular Collections, Browse by Goal, FAQ with Schema.org

---

## Phase 1.5 — Architecture Corrections (2026-06-30)

### Fixed — index.html

1. **Service Worker restored** — `sw.js` registration block added back. PWA offline support works again.
2. **Favicon 32x32 restored** — `<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">`
3. **Favicon 16x16 restored** — `<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png">`
4. **Apple icon-192 restored** — `<link rel="apple-touch-icon" href="/icons/icon-192.png">`
5. **OG image added** — `og:image`, `og:image:width`, `og:image:height`, `og:site_name`
6. **Twitter Card added** — `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`
7. **`app.js` now has `defer`** — was render-blocking; now deferred
8. **`search.js` now has `defer`** — was render-blocking; now deferred

### Fixed — js/search.js (complete rewrite)

- **Was:** 224-line hardcoded array of 107 tools
- **Now:** 224-line data-driven fetch from `/data/tools.json` and `/data/prompts.json`
- Builds tool index at runtime from JSON — adding a tool to `tools.json` automatically adds it to search
- Indexes ALL prompt titles individually (200 prompts searchable)
- Keyboard navigation (↑ ↓ Enter Escape), highlight matching text, accessible ARIA attributes

### Fixed — data/tools.json

- **Was:** 16 tools (placeholder only)
- **Now:** 147 tools (full production list extracted from index.html + 10 new AI/Finance tools)
- This is now the authoritative source for search — no more JS edits needed when adding tools

### Fixed — data/prompts.json

- **41 broken `related_prompts` references** removed (19 distinct missing slugs)
- Zero broken internal links remaining

### Fixed — css/homepage.css

- **FAQ CSS conflict removed** — duplicate production-style `.faq-item` rules (`.faq-item { background: var(--surface)`) removed
- Only V2 aria-based FAQ styles remain in homepage.css
- Production FAQ styles remain exclusively in `css/tools.css`

### Created — Architecture Documentation

- `CSS_DEPLOYMENT_STRATEGY.md` — documents modular source → concatenated production bundle strategy, includes `concat_css.py` build script, per-page loading plan, transition timeline
- `JS_MODULE_STRATEGY.md` — documents module wiring plan, dependency map, target loading pattern, rules for future development

### Updated — js/ module files

- `js/theme.js`, `js/navigation.js`, `js/utils.js` marked clearly as `NOT YET LOADED — Phase 4 task`
- No developer will accidentally think they are active

### Not Changed

- `app.js` — frozen, all 6,734 lines intact
- All 576 prompt pages — unchanged
- All CSS module files (except homepage.css FAQ fix)
- All tool page HTML files

---

## Docs + Phase 2 — Homepage Integration (2026-07-01)

### Created — Permanent Technical Documentation

- `ARCHITECTURE.md` (628 lines) — Full technical reference: project overview, technology constraints, directory structure, design system (all tokens with values), CSS/JS architecture, data layer, prompt library system, theme system, SEO standards, PWA, asset versioning, URL conventions, deployment, phase roadmap
- `CONTRIBUTING.md` (605 lines) — Complete developer guide: getting started, step-by-step instructions for adding tools/editing CSS/adding prompts, code standards, testing checklist, git workflow, file versioning, common mistakes, quick reference cheat sheet

### Phase 2 — Tool Page Head Standardisation

Updated 3 tool pages to match the standard defined in `ARCHITECTURE.md §10`:

**ai-prompt-studio.html:**
- Added favicon-32.png and favicon-16.png
- Added `apple-mobile-web-app-status-bar-style`
- Added `og:site_name`
- Added Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- Added `defer` to `app.js`
- Added service worker registration

**ai-token-counter.html:**
- Added favicon-32.png and favicon-16.png
- Added `apple-mobile-web-app-status-bar-style`
- Added `og:site_name`
- Fixed `twitter:image` to point to `og-image.png` (was `icon-512.png`)
- Added `defer` to `app.js`

**midjourney-prompt-builder.html:**
- Added favicon-32.png and favicon-16.png
- Added `apple-mobile-web-app-status-bar-style`
- Added `og:site_name`
- Added Twitter Card (all meta tags)
- Added `defer` to `app.js`
- Added service worker registration

All 4 pages (index.html + 3 tool pages) now pass the 15-point head standardisation checklist.

---

## Phase 2 — Full Migration Pass (2026-07-01)

### Migration: All 150 HTML pages upgraded to V3 head standard

**Source:** 148 pages from `toolsnova-main_1_.zip` + `index.html` + `ai-prompt-studio.html`

**Applied to every page:**
- `style.css` version: v=19 → v=20
- `app.js` version: v=19 → v=20 with `defer` attribute
- `og:image` added (or corrected from `icon-512.png` to `og-image.png`)
- `og:site_name` added
- Twitter Card added: `twitter:card summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`
- Old `apple-touch-icon favicon.svg` removed, replaced with `/icons/icon-192.png`

**Applied to 47 pages missing favicon PNGs:**
- `favicon-32.png` and `favicon-16.png` added

**Applied to 6 pages with non-standard structure:**
- Full favicon + PWA block injected (manifest, theme-color, mobile-web-app-capable, etc.)
- `ai-token-counter.html`, `islamic-mortgage-calculator.html`, `legal-document-analyzer.html`, `loan-emi-comparison.html`, `mortgage-affordability-calculator.html`, `solar-panel-roi-calculator.html`

**Applied to 9 pages with wrong OG image:**
- `icon-512.png` → `og-image.png` corrected

**Applied to 6 pages with partial Twitter Card:**
- Upgraded from `summary` → `summary_large_image`
- Added missing `twitter:image`

**Result: 150/150 pages pass all 23 head standard checks (100%)**

### Created
- `MIGRATION_REPORT_PHASE2.md` — formal migration report with full details

---

## Phase 3 — AI Prompt Library Integration (2026-07-01)

### generator.py — Complete V3 rewrite (968 lines)

**Architecture change: ONE template, 577 pages.**

- `v3_head()` — single head template with all 23 V3 standard elements (anti-flash, GA, AdSense, canonical, full OG, full Twitter, favicons, manifest, PWA, SW, style.css v20, app.js v20 defer)
- `V3_NAV` — production navigation constant (identical to tool pages, absolute /paths)
- `V3_FOOTER` — production footer constant (identical to tool pages, includes FAB theme toggle + SW registration)
- `schema_breadcrumb()`, `schema_faq()`, `schema_creative_work()`, `schema_webapp()` — pure schema builder functions
- `build_prompt_page()` — single function for all 559 prompt pages
- `build_model_hub()` — 5 model index pages
- `build_category_hub()` — 12 category index pages
- `build_main_hub()` — ai-prompt-library.html with client-side search

**Previously:** inline styles everywhere, duplicate PROMPT_CSS block, separate nav, no Twitter Card, og:image pointed to icon-512.png

**Now:** all CSS from shared /style.css?v=20, production nav/footer, full V3 head, og-image.png, 11 schema types

### Pages regenerated: 577

All 559 prompt pages + 5 model hubs + 12 category hubs + 1 main hub rebuilt with:
- Full V3 23-point head standard
- Production navigation header (identical to tool pages)
- Production footer (identical to tool pages)
- CreativeWork schema on all 559 prompt pages
- BreadcrumbList schema on all 577 pages
- FAQPage schema on all 559 prompt pages (with FAQ data)
- Variable editor with live preview
- Copy prompt button
- Favourites (localStorage)
- Recently viewed (localStorage)
- Model switcher with deep links
- Related prompts section

### ai-prompt-library.html — Updated

- Uses homepage design system (`.v2-section`, `.cat-card-v2`, `.hero-badge`, `.section-title`)
- Browse by model grid
- Browse by category grid (12 categories)
- Featured prompts section
- Recently added section (8 prompts)
- Client-side search over all 200 prompts

### Sitemaps — Updated

- `sitemap-prompts.xml` — 577 URLs (all prompt pages + hubs)
- `sitemap.xml` — 151 URLs (added ai-prompt-library.html)
- `sitemap_index.xml` — NEW: sitemap index file referencing both sitemaps

### Verification: 0 errors, 0 warnings

All 576 HTML files pass all 23 head standard checks.  
All 559 prompt pages pass all 11 prompt-specific checks.  
0 broken related_prompts references.  
0 duplicate IDs or slugs.

---

## Homepage Rebuild — Per Master Homepage Design Spec (2026-07-01)

### HOMEPAGE_DESIGN_SPEC.md — NEW permanent document

Saved as the official, permanent homepage blueprint alongside `ARCHITECTURE.md` and
`CONTRIBUTING.md`. Documents the 12-section structure, design language, color palette,
dynamic data requirements, and QA checklist for all future homepage work.

### index.html — Complete rebuild (541 lines, 12 sections)

1. Navigation — sticky glass nav, AI Workspace mega-menu, Categories mega-menu, bookmark button, mobile overlay
2. Hero — "Find the right tool in 3 seconds", live search bar, popular tags, dual CTA
3. Statistics — 6 animated stat cards (tools, prompts, categories, browser-based, privacy, no signup)
4. Trending Tools — **dynamic**, empty skeleton container populated at runtime from `tools.json`
5. Browse Categories — **dynamic**, grouped and counted from `tools.json` at runtime
6. AI Workspace (flagship) — featured section + **dynamic** tool grid from `tools.json`
7. Recently Added — **dynamic**, sorted by `dateAdded` at runtime
8. Popular Collections — **dynamic**, rendered from `collections.json` at runtime
9. Browse by Goal — "I want to..." 10 goal cards
10. Why ToolsNova — 6 value-proposition cards
11. FAQ — 5 questions with FAQPage schema
12. Newsletter — email capture form
13. Mega Footer — 5-column footer (Brand, Categories, Popular Tools, AI Resources, Company/Legal)

Full V3 head standard (23 checks), WebSite + SearchAction + Organization + FAQPage schema.

### css/homepage.css — Updated (not rewritten)

- Added `--secondary: #5BD6FF` and `--secondary-dim` as homepage-scoped tokens (tokens.css untouched — shared across 727 pages, per "DO NOT TOUCH — Theme")
- Enhanced glass nav: `backdrop-filter: blur(20px) saturate(160%)`, reduced opacity for stronger glass effect
- Added flagship glow treatment to AI Workspace section (`::before` radial gradient using `--secondary-dim`) and `.featured-flagship-badge`
- Added skeleton loading state (`.skeleton-grid`, `.skeleton-card`, `@keyframes skeletonPulse`) for dynamic sections while JSON loads

### js/search.js — Rewritten (224 → 404 lines)

**Search (extended):**
- Now indexes 4 data sources instead of 2: `tools.json`, `prompts.json`, **`categories.json`** (new), **`collections.json`** (new)
- Search index grew from ~359 entries to 364 entries (147 tools + 200 individual prompts + 12 prompt categories + 5 collections)
- Collection results scroll to the matching collection card in-page instead of navigating away

**Homepage rendering (new):**
- `renderTrending()` — populates Trending Tools from `tools.json` where `featured: true`
- `renderCategories()` — groups and counts `tools.json` entries by `category`, renders category cards with per-category icon/description map
- `renderAiWorkspace()` — filters `tools.json` where `category === "AI"`, renders both the workspace chip row and the tool grid
- `renderRecentlyAdded()` — sorts `tools.json` by `dateAdded` descending, renders top 8
- `renderCollections()` — renders `collections.json`, resolving each collection's tool URLs against `tools.json` for display names
- `renderStats()` — wires live counts into the animated stat counters
- All functions are pure data → HTML, zero hardcoded tool/category/collection content in `index.html`

### data/tools.json — Enriched

- Added `featured: boolean` to all 147 entries (16 tools marked featured, spread across categories)
- Added `dateAdded: "YYYY-MM-DD"` to all 147 entries (15 recent tools dated accurately, rest baselined to 2026-05-01)
- **Fixed:** AI Token Counter was miscategorized as `"Utilities"` — corrected to `"AI"` so it appears in the AI Workspace section (now 5 AI tools instead of 4)

### Verification performed

- Node.js syntax check on `search.js` — valid
- Simulated all render functions against real production data in Node — zero errors, all sections populate correctly (12 trending, 12 categories, 5 AI tools, 8 recent, 5 collections, 0 broken collection→tool links)
- Python `html.parser` tag-balance validation on `index.html` — all tags closed correctly
- CSS brace-balance check on `homepage.css` — 157 open / 157 close
- Full recursive diff against the Phase 3 zip snapshot — confirmed **only** `index.html`, `css/homepage.css`, `js/search.js`, and `data/tools.json` changed; all 150 tool pages, all 577 prompt pages, `generator.py`, and all documentation are byte-identical to Phase 3

### Not touched (per spec's DO NOT TOUCH list)

Tool pages · Prompt pages · `generator.py` · Analytics/AdSense IDs · `css/tokens.css` (shared theme) · `toggleTheme()` · Service worker · PWA manifest · `ARCHITECTURE.md` · `CONTRIBUTING.md` · sitemaps

---

## Phase 3.5 — Final Homepage Implementation (2026-07-01)

### Goal
Match the homepage exactly to the approved design reference image, section by section,
and fix the previously-rejected AI Prompt Library CSS loading bug.

### index.html — Rebuilt sections
- Navigation: icon-only search/bookmark/theme buttons, added Home + AI Prompts direct links
- Hero: replaced decorative orb with a browser-chrome tool-preview mockup (search bar + 4 tool rows) plus floating code/calculator/lightning badges and dual orbit rings
- Stats: 6 cards now use colour-tinted icon badges; added "50K+ Happy Users" stat to match reference
- Trending Tools: added 🔥 flame icon to section eyebrow
- AI Workspace: fully restructured — brain illustration on the left, 2×2 icon+title+description item grid on the right (previously: chip row + browser mockup)
- Popular Collections: switched to compact icon+name+count cards (previously: full tool-link-list cards)
- Browse by Goal: updated icon set and labels to match reference (Write with AI, Analyze Data, Calculate Finance, Convert Files, Compress Images, Generate Password, Test Code, +3 more)
- Why ToolsNova: converted from vertical icon-top cards to horizontal icon-left cards
- Newsletter: added envelope icon badge, updated copy to match reference exactly

### css/homepage.css — Extended
- New colour-tinted icon-badge system (`--secondary` token + 8 colour variants), scoped to homepage only — `tokens.css` untouched
- New hero mockup / orbit-ring / floating-badge styles
- New AI Workspace 2-column layout styles
- New compact collection card styles
- Fixed: `.scroll-fade` sections lacking a JS render hook (Browse by Goal) never got `.visible` — no CSS fix needed, root cause was JS (see below)
- Fixed: NEW badge `float:right` had no effect inside a flex container — replaced with `position:absolute`, scoped to `#recently-added-grid`

### js/search.js — Render logic rewritten
- All dynamic-section templates now emit colour-badged markup via a new `CATEGORY_COLOR` map
- `renderAiWorkspace()` rewritten for the new 2×2 item-grid markup (`#ai-workspace-items`)
- `renderCollections()` rewritten for compact cards (icon + name + count only)
- Added `initStaticScrollFade()` — an `IntersectionObserver` safety net that reveals any `.scroll-fade` element not already handled by a render function, since `js/utils.js` (which normally owns this) is not yet wired per `JS_MODULE_STRATEGY.md`
- **Design decision documented in-code:** Browse Categories is sourced from `tools.json` (grouped by its own `category` field), not `categories.json`. `categories.json` holds the Prompt Library's category taxonomy (writing, seo, coding…) which is a different, incompatible taxonomy from tool categories (Developer, Trading, Finance…). Repurposing it would have required touching the Prompt Library — explicitly protected under "DO NOT TOUCH: Generator, Prompt Pages."

### generator.py — One-line, spec-mandated fix
- Added `<link rel="stylesheet" href="/css/prompt-library.css?v={VERSION}">` to the shared `v3_head()` template
- Regenerated all 577 prompt library pages (559 prompt pages + 5 model hubs + 12 category hubs + 1 main hub)
- **Verified:** diffed a sample page against the pre-fix version — exactly one line differs, zero content changes
- This was an explicit, scoped exception to the "DO NOT TOUCH: Generator, Prompt Pages" rule, authorized by this phase's own instructions: *"Current implementation is rejected. Fix completely."*

### Visual QA — real browser verification (Playwright + headless Chromium)
- Rendered and screenshotted: homepage (Desktop/Tablet/Mobile, full page), AI Prompt Library hub, one individual prompt page
- Found and fixed 3 real bugs this way (Prompt Library CSS, Browse-by-Goal visibility, NEW badge positioning) — none of which were caught by static HTML/CSS/JS validation alone
- Zero local console errors; only external Google Fonts/GA/AdSense requests failed, blocked by this sandbox's network policy (expected to work normally on the live domain)
- Confirmed two apparent "bugs" were actually screenshot-capture artifacts, not real issues: `position: sticky` nav and `position: fixed` theme button appearing to "repeat" in tall full-page screenshots (Chromium stitches full-page captures in slices; sticky/fixed elements render at their stuck position in each slice — real users only ever see them once)

---

## Phase 3.5 Revision 2 — Root Cause Fix for Rejected Browser Test (2026-07-01)

The first Phase 3.5 delivery was rejected. Investigation (reproducing the exact
failure via Playwright + `file://`, not assumption) found one architectural root
cause behind all 9 reported issues: **leading-slash absolute paths break under
`file://`, and `fetch()` is unconditionally blocked under `file://` by every
modern browser regardless of path style** (verified with an isolated minimal
repro before touching any real code).

### generator.py
- `v3_head()`: replaced leading-slash paths for favicons/manifest/`style.css`/`css/prompt-library.css` with a computed relative prefix (`rel_prefix = '../' * canonical_path.count('/')`)
- `V3_FOOTER` converted from a static string constant to `v3_footer(rel_prefix='')`, so its `<script src="app.js">` also resolves correctly at every page depth
- **Bug caught during this fix, before shipping:** the new `rel_prefix` variable initially collided with an existing loop variable named `rel` (used for "related prompt" objects), which corrupted output — a Python dict literal leaked into a `<script src>` attribute on generated pages. Caught by inspecting the generated HTML output before regenerating all pages; fixed by renaming to `rel_prefix` throughout
- Regenerated all 577 pages (dry-run verified first)

### index.html
- Favicon/manifest links switched from `/icons/...` to `icons/...` (relative)
- Added an embedded-data fallback block: `tools.json` + `categories.json` + `collections.json` (~38KB combined) as `<script type="application/json">` elements, with defensive `</script` escaping for future data safety. `prompts.json` (1.2MB) intentionally excluded — too large to embed without hurting real-world performance

### js/search.js
- `fetch()` calls switched from `/data/tools.json` to `data/tools.json` (relative — correct for any HTTP subpath deployment)
- `loadAllData()` now checks `location.protocol === 'file:'` upfront and skips the `fetch()` attempt entirely in that case, going straight to the embedded fallback — this avoids not just JS-level errors but the browser's own network-layer console logging for a request already known to fail
- Added `readEmbedded(id)` helper to parse the inline JSON blocks
- `renderStats()` fixed to only overwrite a stat's `data-target` when real data is available, so the "200+ AI Prompts" stat doesn't regress to "0+" when `prompts.json` can't be loaded (e.g. under `file://`)

### Verification performed
- Reproduced the original failure with an isolated fetch-under-file:// test before writing any fix (confirmed: relative AND absolute paths both fail identically — the browser blocks the scheme, not the path)
- Re-tested every one of the 9 reported issues individually via Playwright DOM queries (not just visual screenshots) under `file://`: all pass
- Re-tested the same suite over a real HTTP server to confirm zero regression to the production-equivalent path
- Screenshotted: full homepage (file:// and http://), search autocomplete dropdown showing real results, Prompt Library hub, individual prompt page — all under `file://` to match the original failing test condition
- Confirmed zero local console errors under both protocols (remaining errors are exclusively the external AdSense script, blocked by this sandbox's network policy — not a code issue)

---

## RC0 — Phase 3.6 Intermediate Build (2026-07-02)

**Frozen for review per explicit stop-and-package instruction. Phase 3.6 is
NOT complete — see PROJECT_STATUS.md for remaining task list.**

### New files
- `pages_generator.py` — registry-driven page generator for category and
  collection pages (permanent, extensible framework — separate from and
  does not touch `generator.py`, the protected Prompt Library generator)
- `PAGES_GENERATOR.md` — permanent documentation for the above
- `inject_related_tools.py` — injects a dynamically-generated "Related
  Tools" section into every tool page from `tools.json`
- `RELEASE_NOTES_RC0.md` — this build's release notes
- 12 category landing pages: `developer-tools/`, `finance-tools/`,
  `trading-tools/`, `utilities/`, `health-tools/`, `student-tools/`,
  `construction-tools/`, `converter-tools/`, `ai-tools/`, `math-tools/`,
  `prop-firm-tools/`, `fun-tools/`
- 5 collection landing pages under `collections/`

### Modified files
- `js/search.js` — `renderCategories()` and `renderCollections()` now link
  to the new real landing pages instead of a representative tool / same-page
  anchor
- All 147 root-level tool pages — Related Tools section injected; two
  different pre-existing hardcoded "Related Tools" implementations found
  and removed to prevent duplication (see below)
- `ai-api-cost-calculator.html` — restored (was missing from the project
  entirely) and brought up to the 23-point head standard
- `css-minifier.html` — fixed unescaped `<head>`/`<script>` literals in
  content prose that were corrupting the page's DOM structure

### Bugs found and fixed this session

1. **Category/collection cards on homepage linked to the wrong place.**
   Root cause: `renderCategories()` used a representative tool's URL;
   `renderCollections()` used a same-page anchor (`#collection-{id}`) —
   because the real landing pages didn't exist yet at the time those
   functions were written. Fixed by pointing both to the newly-generated
   pages.

2. **Duplicate "Related Tools" sections on 138 of 147 tool pages.**
   Root cause: two different legacy hand-hardcoded "Related Tools"
   implementations already existed in the codebase from before Phase 3.6
   (Template A — `<section class="related-section">`, 132 pages; Template
   B — `<div class="related-tools-section">` with `class="related-title"`
   heading, 6 pages), neither of which was derived from `tools.json`. The
   injector's initial idempotency check only guarded against its own
   previous runs, not these pre-existing blocks, so both an old hardcoded
   section and the new dynamic one rendered on the same page. Fixed by
   auditing the actual page structure (not guessing), writing one targeted
   removal pattern per template, and verifying 147/147 pages end up with
   exactly one section.

3. **`ai-api-cost-calculator.html` missing entirely.** Present in
   `data/tools.json` and linked from the homepage/nav, but the file itself
   was never migrated into the project during Phase 2. Found via the
   Related Tools injector's dry-run reporting a "file not found" skip.
   Recovered from an earlier delivery and brought up to the current head
   standard.

4. **Broken HTML in `css-minifier.html`'s content text.** The page's
   educational prose described "critical CSS in the HTML `<head>`" without
   escaping the tag, and also contained a literal, unescaped inline
   `<script>` snippet in body text. Both were interpreted as real markup by
   the parser, corrupting the head/body boundary. Fixed by HTML-escaping
   the offending text. **`regex-tester.html` has the identical bug and is
   not yet fixed** — carried into remaining work.

### Verification performed
- `147/147` tool pages confirmed to have exactly one Related Tools section
  (zero missing, zero duplicated) via direct HTML inspection, not assumption
- HTML tag-balance check run across all 152 root-level `.html` files;
  2 broken found, 1 fixed (`css-minifier.html`), 1 remaining
  (`regex-tester.html`)
- Category and collection page rendering spot-verified via Playwright
  earlier in the session (before the server became unstable) — both
  templates confirmed working with correct dynamic content
