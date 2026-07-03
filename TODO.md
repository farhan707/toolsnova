# ToolsNova V3 — TODO

## Phase 1 ✅ COMPLETE — Architecture Restructuring
## Phase 1.5 ✅ COMPLETE — Architecture Corrections
## Docs ✅ COMPLETE — ARCHITECTURE.md + CONTRIBUTING.md
## Phase 2 ✅ COMPLETE — Full Head Standard Migration

### Phase 2 completed tasks:
- [x] Update index.html to V3 standard
- [x] Update ai-prompt-studio.html to V3 standard
- [x] Update ai-token-counter.html to V3 standard
- [x] Update midjourney-prompt-builder.html to V3 standard
- [x] Update all 148 production tool pages to V3 standard
- [x] Version bump all pages: style.css v19→v20, app.js v19→v20
- [x] Add defer to app.js on all 150 pages
- [x] Add og:image (og-image.png) to all pages
- [x] Add og:site_name to all pages
- [x] Add Twitter Card (5 tags) to all pages
- [x] Upgrade twitter:card from summary to summary_large_image
- [x] Fix favicon-32.png and favicon-16.png on 47 pages
- [x] Fix icon-512.png references to og-image.png on 9 pages
- [x] Inject full favicon/PWA block on 6 non-standard pages
- [x] Remove old apple-touch-icon pointing to favicon.svg
- [x] Verify 150/150 pages pass all 23 checks
- [x] Produce formal migration report

---

## Phase 3 — Prompt Library Integration

- [ ] Update all 576 prompt page headers to match V3 standard (GA, AdSense, Twitter, full PWA block)
- [ ] Add V2 nav component to prompt pages (unified navigation)
- [ ] Update `ai-prompt-library.html` header to V3 standard
- [ ] Fix prompt page fonts: add Inter/Plus Jakarta Sans alongside IBM Plex Mono
- [ ] Add prompt library to main sitemap.xml
- [ ] Regenerate sitemap-prompts.xml with correct canonical URLs
- [ ] Verify all 576 prompt pages pass the 23-point head check
- [ ] Produce Phase 3 migration report

## Phase 4 — JS Modularization + Search

- [ ] Wire `js/theme.js` into index.html and verify tool pages still work
- [ ] Wire `js/navigation.js` into index.html
- [ ] Wire `js/utils.js` and remove duplicate functions from app.js
- [ ] Begin extracting tool functions into `js/tools/{toolname}.js`
- [ ] Add Ctrl+K keyboard shortcut to open search from any page
- [ ] Add recent searches (localStorage)
- [ ] Populate data/tools.json: verify it is exactly in sync with actual tool pages

## Phase 5 — SEO + CSS Build Pipeline

- [ ] Audit every tool page for WebApplication schema (already present — verify)
- [ ] Add CreativeWork schema to all prompt pages
- [ ] Add breadcrumb schema to prompt pages
- [ ] Generate unified sitemap.xml (tools + prompts + static pages)
- [ ] Update robots.txt
- [ ] Submit new sitemaps to Google Search Console
- [ ] Run `build/concat_css.py` → create `dist/` bundles
- [ ] Replace @import chain with per-page `<link>` to `dist/` bundles
- [ ] Create `og-image.png` (1200×630) for OG and Twitter cards

## Ongoing

- [ ] Keep `data/tools.json` in sync whenever a new tool is deployed
- [ ] Keep `data/prompts.json` regenerated whenever new prompts are added
- [ ] Update `?v=20` → `?v=21` across all pages on next deployment

---

## Phase 3 ✅ COMPLETE — AI Prompt Library Integration

### Phase 3 completed tasks:
- [x] Rewrite generator.py as V3 (968 lines, one template)
- [x] Create v3_head() — single shared head template, all 23 checks
- [x] Create V3_NAV — production navigation, absolute paths
- [x] Create V3_FOOTER — production footer with FAB + SW registration
- [x] Implement schema_breadcrumb(), schema_faq(), schema_creative_work()
- [x] Regenerate all 559 prompt pages with production nav/footer
- [x] Regenerate 5 model hub pages
- [x] Regenerate 12 category hub pages
- [x] Update ai-prompt-library.html with homepage design system
- [x] Add client-side search to prompt library hub
- [x] Fix og:image from icon-512.png to og-image.png on all prompt pages
- [x] Add Twitter Card (summary_large_image) to all prompt pages
- [x] Add CreativeWork schema to all 559 prompt pages
- [x] Add FAQPage schema to all 559 prompt pages
- [x] Add BreadcrumbList schema to all 577 pages
- [x] Update sitemap-prompts.xml (577 URLs)
- [x] Update sitemap.xml (added ai-prompt-library.html)
- [x] Create sitemap_index.xml
- [x] Verify: 0 errors, 0 warnings
- [x] Produce Phase 3 Migration Report

---

## Homepage Rebuild ✅ COMPLETE — Per HOMEPAGE_DESIGN_SPEC.md

### Completed tasks:
- [x] Save Master Homepage Design Specification as permanent HOMEPAGE_DESIGN_SPEC.md
- [x] Rebuild index.html — all 12 spec sections
- [x] Section 1: Sticky glass navigation with AI Workspace + Categories mega-menus
- [x] Section 2: Hero with live search, popular tags, dual CTA
- [x] Section 3: Statistics (6 animated cards)
- [x] Section 4: Trending Tools — made fully dynamic (was previously static in earlier V2 build)
- [x] Section 5: Browse Categories — made fully dynamic (grouped from tools.json)
- [x] Section 6: AI Workspace flagship section + dynamic tool grid
- [x] Section 7: Recently Added — made fully dynamic (sorted by dateAdded)
- [x] Section 8: Popular Collections — made fully dynamic (from collections.json)
- [x] Section 9: Browse by Goal (10 goal cards)
- [x] Section 10: Why ToolsNova (6 cards)
- [x] Section 11: Newsletter
- [x] Section 12: Mega Footer (5 columns)
- [x] Update css/homepage.css — secondary color token, glass nav, flagship glow, skeletons
- [x] Rewrite js/search.js — search now indexes categories.json + collections.json too
- [x] Add homepage dynamic-rendering functions to js/search.js
- [x] Enrich data/tools.json with featured + dateAdded fields
- [x] Fix AI Token Counter category (Utilities → AI)
- [x] Verify: 23-point head standard PASS
- [x] Verify: HTML tag balance PASS
- [x] Verify: CSS brace balance PASS
- [x] Verify: JS syntax valid (node --check)
- [x] Verify: render logic simulated against real data, 0 errors
- [x] Verify: full diff against Phase 3 snapshot — only 4 files changed, everything else untouched
- [x] Update PROJECT_STATUS.md, CHANGELOG.md, TODO.md

---

## Phase 4 — AI Ecosystem Expansion (Next)
- [ ] Add more AI tools to reach flagship parity with spec vision
- [ ] Expand prompts.json toward 500+ prompts
- [ ] Add "Compare AI Models" tool
- [ ] Add AI tool recommendation engine on prompt pages

## Phase 5 — Performance Optimization
- [ ] Run build/concat_css.py → dist/ bundles (see CSS_DEPLOYMENT_STRATEGY.md)
- [ ] Replace @import chain with per-page <link> tags
- [ ] Lighthouse audit — target 95+
- [ ] Lazy-load below-the-fold sections
- [ ] Image optimization pass

## Phase 6 — Advanced SEO
- [ ] Add WebApplication schema audit across all 150 tool pages
- [ ] Internal linking audit
- [ ] Submit updated sitemaps to Search Console

## Phase 7 — Release Candidate
- [ ] Full QA pass against HOMEPAGE_DESIGN_SPEC.md checklist
- [ ] Cross-browser testing
- [ ] Final approval before production deploy

---

## Phase 3.5 ✅ COMPLETE — Final Homepage Implementation

- [x] Fix rejected AI Prompt Library CSS (add prompt-library.css link, regenerate 577 pages)
- [x] Rebuild Hero section to match design reference (browser mockup, orbit rings, floating badges)
- [x] Rebuild Stats section (colour icon badges, 50K+ Happy Users stat)
- [x] Add flame icon to Trending Tools eyebrow
- [x] Restructure AI Workspace (illustration left, 2×2 item grid right)
- [x] Convert Popular Collections to compact icon+name+count cards
- [x] Update Browse by Goal icons/labels to match reference
- [x] Convert Why ToolsNova to horizontal icon-left layout
- [x] Add envelope icon to Newsletter section
- [x] Update nav to icon-only action buttons
- [x] Add colour-badge icon system to homepage.css (scoped, tokens.css untouched)
- [x] Fix scroll-fade bug (Browse by Goal was invisible) — found via real browser testing
- [x] Fix NEW badge float bug (was rendering full-width) — found via real browser testing
- [x] Verify with real headless Chromium (Playwright), not simulation
- [x] Screenshot homepage: Desktop, Tablet, Mobile (full page)
- [x] Screenshot AI Prompt Library hub
- [x] Screenshot individual prompt page
- [x] Verify zero local console errors
- [x] Verify all dynamic sections populate from JSON (zero hardcoded cards)
- [x] Full file-scope diff against previous snapshot — confirmed only allowed files changed
- [ ] Lighthouse audit — not run (no external network access in this sandbox); recommend running on live/staging deployment before Phase 4 sign-off

---

## Phase 4 — AI Ecosystem Expansion (Next)
- [ ] Add more AI tools to reach flagship parity with spec vision
- [ ] Expand prompts.json toward 500+ prompts
- [ ] Add "Compare AI Models" tool
- [ ] Wire js/theme.js, js/navigation.js, js/utils.js per JS_MODULE_STRATEGY.md
- [ ] Run real Lighthouse audit on staging/production domain

---

## Phase 3.5 Revision 2 ✅ COMPLETE — All 9 Rejected Issues Fixed & Browser-Verified

- [x] Reproduce the exact failure via file:// before writing any fix
- [x] Isolate root cause: fetch() blocked under file:// (browser restriction, confirmed via isolated test)
- [x] Isolate root cause: leading-slash paths resolve to filesystem root under file://
- [x] Fix generator.py: depth-aware relative paths for CSS/JS/favicons on all 577 prompt pages
- [x] Catch and fix a variable-name collision bug introduced by the first fix attempt (caught before shipping)
- [x] Fix index.html: relative favicon/manifest paths
- [x] Add embedded JSON fallback (tools/categories/collections) to index.html for file:// resilience
- [x] Fix js/search.js: protocol detection to skip fetch() under file://, use embedded fallback
- [x] Fix renderStats() regression (200+ prompts stat was being overwritten with 0+)
- [x] Verify issue 1 (search) — DOM-level check, not just visual
- [x] Verify issue 2 (Trending) — 12 tools confirmed
- [x] Verify issue 3 (Categories) — 12 categories confirmed
- [x] Verify issue 4 (AI Workspace) — 5 tools confirmed
- [x] Verify issue 5 (Recently Added) — 8 tools confirmed
- [x] Verify issue 6 (Collections) — 5 collections confirmed
- [x] Verify issue 7 (Browse by Goal) — 10 goals confirmed
- [x] Verify issue 8 (Prompt Library CSS) — computed font-family + background confirmed correct, both hub and individual prompt page
- [x] Verify zero regression on real HTTP server (production-equivalent path)
- [x] Verify zero local console errors under file://
- [x] Screenshot every fix
- [x] Re-verify file scope discipline (diff against rejected zip)
