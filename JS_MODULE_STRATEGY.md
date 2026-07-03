# ToolsNova — JavaScript Module Strategy

## Current State (Post Phase 1.5)

### What exists

```
app.js               ← Production monolith (6,734 lines) — UNCHANGED
                       Contains: theme, toast, copyEl, setStatus, navToggle
                       + ALL tool-specific functions (JSON, regex, trading, etc.)

js/search.js         ← DATA-DRIVEN unified search (Phase 1.5) — ACTIVE
                       Loaded on index.html only via <script defer>
                       Fetches /data/tools.json + /data/prompts.json at runtime

js/theme.js          ← Extracted theme module — NOT YET WIRED
js/navigation.js     ← Extracted navigation module — NOT YET WIRED
js/utils.js          ← Extracted utility module — NOT YET WIRED
js/app-header.js     ← Architecture reference — NOT PRODUCTION CODE
```

### Why app.js was NOT refactored in Phase 1

The directive was: "Do not break existing tools." Splitting `app.js` carries risk:
- 100+ tool functions with interdependencies
- Tool pages call global functions by name (e.g. `jsonFormat()`, `toggleTheme()`)
- Any missed function = broken tool for users
- Phase 1 was architecture only, not refactoring

The `/js/` module files were written as the TARGET state, not the current state.
They are **reference implementations** that show what the code should look like
when it is extracted in Phase 4.

## Wiring Plan (Phase 4)

### Step 1 — Wire theme.js to index.html
```html
<!-- index.html only (V2 nav has its own theme button) -->
<script src="js/theme.js?v=20" defer></script>
```
Remove the inline theme logic from app.js bottom. Verify all tool pages still work.

### Step 2 — Wire navigation.js
```html
<script src="js/navigation.js?v=20" defer></script>
```
Test mobile nav on all screen sizes.

### Step 3 — Wire utils.js
Replace toast/copy/FAQ inline calls in app.js with imports from utils.js.
This is the largest risk step — test every tool.

### Step 4 — Extract tool functions
Each tool's JS moves to its own file:
```
js/tools/json-formatter.js
js/tools/base64-encoder.js
js/tools/word-counter.js
...
```
Each tool page loads only what it needs:
```html
<script src="app.js?v=20" defer></script>           <!-- shared utils -->
<script src="js/tools/json-formatter.js?v=20" defer></script>
```
This reduces initial JS load from 324 KB to ~20-30 KB per tool page.

## Current Loading Pattern

```
ALL pages:     <script src="app.js?v=20" defer>         (324 KB)
index.html:    <script src="js/search.js?v=20" defer>   (7 KB)
```

## Target Loading Pattern (Phase 4+)

```
ALL pages:     <script src="js/core.js?v=20" defer>     (~15 KB — theme, toast, nav, utils)
index.html:    <script src="js/search.js?v=20" defer>   (7 KB — data-driven)
tool pages:    <script src="js/tools/{tool}.js" defer>  (~5-20 KB each)
```

Estimated first-load JS reduction: 324 KB → 20-30 KB per page.

## Rules

1. **app.js is frozen** until Phase 4. Do not edit its internals.
2. **js/search.js is active** — it is the only module currently wired in.
3. **js/theme.js, js/navigation.js, js/utils.js** are reference implementations.
   They must be labelled `/* NOT YET LOADED */` at the top until wired.
4. **No new global functions** should be added to app.js after Phase 2.
   New functionality goes into `/js/` modules from Phase 3 onward.
5. **Tool-specific code** always goes in `js/tools/{toolname}.js`, never in app.js.

## Dependency Map

```
app.js
  └── toggleTheme()         → will move to js/theme.js
  └── showToast()           → will move to js/utils.js
  └── copyEl()              → will move to js/utils.js
  └── setStatus()           → will move to js/utils.js
  └── navToggle()           → will move to js/navigation.js
  └── jsonFormat()          → will move to js/tools/json-formatter.js
  └── ... (100+ tool fns)   → will each move to js/tools/{name}.js

js/search.js (ACTIVE — Phase 1.5)
  └── Loads /data/tools.json
  └── Loads /data/prompts.json
  └── No dependencies on app.js
```
