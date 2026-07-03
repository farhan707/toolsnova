# 📘 ToolsNova V3 — Master Homepage Design Specification (Version 1.0)

> **This is the official, permanent blueprint for the ToolsNova homepage.**
> **It must never be deleted.**
> Future sessions must refer to this document before implementing any homepage change.
> Sits alongside `ARCHITECTURE.md`, `CONTRIBUTING.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`, `TODO.md` as a permanent project document.

---

## 🎯 Project Goal

Build the most modern, premium and SEO-friendly browser tools homepage on the internet.

The homepage should instantly communicate: AI, Developer Tools, Trading, Finance, Utilities, Free Browser Tools.

It should feel closer to Linear, Vercel, Raycast, Warp, Notion, and Stripe than a traditional "tools website."

---

## 🎨 Design Language

**Theme:** Premium Dark · Neon Green Accent · Modern Glass · Minimal · Spacious · Professional

**Typography**
| Role | Font |
|---|---|
| Headings | Syne |
| Body | Inter |
| Code | IBM Plex Mono |

**Color Palette (spec reference values)**
| Token | Value |
|---|---|
| Background | `#0B0D11` |
| Surface | `#13161C` |
| Card | `#171B22` |
| Primary | `#7FFF6B` |
| Secondary | `#5BD6FF` |
| Text | `#FFFFFF` |
| Muted | `#A8B0BE` |

> **Implementation note:** These values are near-identical to the existing shared design tokens in `css/tokens.css` (`--bg: #0c0c0e`, `--surface: #141416`, `--card: #13161D`, `--accent: #7fff6f`, `--text: #f0f0f2`, `--text2: #9090a0`). Per the "DO NOT TOUCH — Theme" rule, `tokens.css` is not modified since it is shared across all 727 pages. The homepage uses the existing shared tokens (which already match this palette within a rounding error) and adds one homepage-scoped variable, `--secondary: #5BD6FF`, defined locally inside `homepage.css` only.

---

## 🏆 Homepage Mission

Within 5 seconds, a visitor should understand:
✔ What ToolsNova is · ✔ How many tools exist · ✔ AI Prompt Library exists · ✔ Everything is free · ✔ No signup required · ✔ Search everything

---

## 🧩 Homepage Structure (12 Sections)

1. **Navigation** — Logo, Search Icon, AI Workspace, AI Prompt Library, Categories, Collections, Theme Toggle, Bookmark, Mobile Menu. Sticky, glass effect.
2. **Hero** — "Find the right tool in 3 seconds." Subheading: 155+ free browser tools, 200+ AI prompts, Fast, Private, No signup. CTAs: Explore Tools / AI Prompt Library. Large search bar. Popular searches. Animated illustration.
3. **Statistics** — 155+ Tools, 200+ Prompts, 12 Categories, 100% Browser Based, Privacy First, No Signup.
4. **Trending Tools** — Dynamic, sourced from `tools.json` (`featured: true`).
5. **Browse Categories** — Dynamic cards: Developer, Trading, Finance, Utilities, Converters, Health, Education, AI, Construction, Math.
6. **AI Workspace ⭐** (flagship) — AI Prompt Library, Prompt Studio, Token Counter, API Cost Calculator, Midjourney Builder, future AI tools.
7. **Recently Added** — Dynamic, sourced from `tools.json` (`dateAdded`, sorted descending).
8. **Popular Collections** — Developer Starter Kit, Forex Toolkit, Finance Toolkit, Student Toolkit, AI Toolkit, SEO Toolkit — sourced from `collections.json`.
9. **Browse by Goal** — "I want to..." Write with AI, Trade Gold, Compress Image, Generate Password, Calculate Mortgage, Debug JSON, Create QR Code, Build Regex, Convert PDF.
10. **Why ToolsNova** — Always Free, Private, Fast, No Signup, Regular Updates, Made for Everyone.
11. **Newsletter** — Simple, premium, no spam messaging.
12. **Mega Footer** — Categories, Popular Tools, AI Resources, Company, Legal, Social.

---

## 🔍 Search

Must search: Tools, Prompt Library, Categories, Collections, Future AI additions.

**Data sources:** `data/tools.json`, `data/prompts.json`, `data/categories.json`, `data/collections.json`.

**Never hardcode.** All search results are built from these JSON files at runtime.

---

## 📊 Dynamic Data

Everything reads from:
- `data/tools.json`
- `data/categories.json`
- `data/collections.json`
- `data/prompts.json`

The homepage automatically reflects changes to these files — no HTML edits required to add/remove tools, prompts, categories, or collections from Trending Tools, Browse Categories, AI Workspace, Recently Added, or Popular Collections.

---

## 🚫 DO NOT TOUCH

Do not modify: Tool Pages · Prompt Pages · Generator · Analytics · AdSense · Search Logic (only extend, never break) · Theme system (`tokens.css`, `toggleTheme()`) · Service Worker · PWA · Architecture · Documentation · SEO standard.

**Only the homepage is in scope for this phase.**

---

## 📱 Responsive

Must work perfectly on Desktop, Tablet, and Mobile.

---

## ⚡ Performance Targets

- Lighthouse score: 95+
- CLS: < 0.1
- LCP: < 2s
- No duplicate CSS
- No duplicate JS

---

## 🔎 SEO Requirements

Keep: Canonical · Schema · Breadcrumb · FAQ · Twitter Card · Open Graph · SearchAction · Organization schema.

---

## 📦 Deliverables

| File | Status |
|---|---|
| `index.html` | Rebuilt |
| `css/homepage.css` | Updated |
| `js/search.js` | Updated (search + dynamic homepage rendering) |
| `data/tools.json` | Enriched with `featured` and `dateAdded` fields |

No other files touched unless absolutely required.

---

## 🧪 QA Checklist

- [ ] Hero renders correctly
- [ ] Search works (tools + prompts + categories + collections)
- [ ] Categories render dynamically from data
- [ ] AI Workspace section complete
- [ ] Collections render dynamically from data
- [ ] Newsletter form works
- [ ] Footer complete (mega footer, 6 columns)
- [ ] Dark mode correct
- [ ] Light mode correct
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] No console errors
- [ ] No broken links
- [ ] No missing CSS
- [ ] No missing JS
- [ ] Everything dynamic (zero hardcoded tool/prompt/category/collection HTML)

---

## 🏁 Definition of Done

The homepage must:
✅ Match this specification
✅ Keep the existing architecture
✅ Keep all production functionality
✅ Be fully responsive
✅ Be SEO friendly
✅ Load quickly
✅ Use dynamic data exclusively for tools/categories/collections/prompts
✅ Be future-ready for 500+ tools and 1000+ AI prompts

---

## 🚀 Roadmap After Homepage Approval

Phase 4 — AI Ecosystem Expansion → Phase 5 — Performance Optimization → Phase 6 — Advanced SEO → Phase 7 — Release Candidate → Production
