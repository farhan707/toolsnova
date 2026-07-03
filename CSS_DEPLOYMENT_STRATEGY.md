# ToolsNova — CSS Deployment Strategy

## Current State (Development)

CSS is split into 9 purpose-specific modules under `/css/`:

```
css/tokens.css          ← Design tokens (variables, reset, base HTML)
css/header.css          ← Site header, nav, mobile nav
css/footer.css          ← Simple + premium footer
css/cards.css           ← All card types
css/search.css          ← Search bar + autocomplete
css/tools.css           ← Tool page layout + buttons
css/homepage.css        ← Homepage-only sections + animations
css/prompt-library.css  ← Prompt library styles
css/tool-components.css ← Tool-specific UI (JSON syntax, diff, etc.)
```

These are loaded via `@import` in `style.css` during development for:
- Separation of concerns
- Easy debugging (Chrome DevTools shows which rule came from which file)
- Team-friendly: one developer can change cards.css without touching tools.css

## Production Problem

`@import` chains block rendering. The browser:
1. Downloads `style.css`
2. Parses it, finds 8 `@import` statements
3. Downloads each imported file **sequentially** (cannot parallelise @imports)
4. Total: 9 HTTP requests before any styling appears

This increases First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

## Production Solution — CSS Concatenation (No Bundler Needed)

Before deployment, concatenate all CSS modules into a single file using a simple Python script.
No npm, no webpack, no build tools required.

### Build Script (`build/concat_css.py`)

```python
#!/usr/bin/env python3
"""
ToolsNova CSS build — concatenates modular CSS into production bundle.
Run before deployment: python3 build/concat_css.py
"""
import re, os

# Order matters — must match @import order in style.css
MODULES = [
    'css/tokens.css',
    'css/header.css',
    'css/footer.css',
    'css/cards.css',
    'css/search.css',
    'css/tools.css',
    'css/tool-components.css',
]

HOMEPAGE_MODULES = [
    'css/tokens.css',
    'css/header.css',
    'css/footer.css',
    'css/cards.css',
    'css/search.css',
    'css/homepage.css',
]

PROMPT_MODULES = [
    'css/tokens.css',
    'css/header.css',
    'css/footer.css',
    'css/cards.css',
    'css/prompt-library.css',
]

FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');\n\n"

def concat(modules, output_path, extra_font=None):
    parts = [extra_font or FONT_IMPORT]
    for mod in modules:
        content = open(mod).read()
        # Strip any @import lines (they're already concatenated)
        content = re.sub(r"@import url\('[^']+'\);?\n?", '', content)
        parts.append(f"/* === {mod} === */\n{content}\n")
    with open(output_path, 'w') as f:
        f.write(''.join(parts))
    size = os.path.getsize(output_path)
    print(f"✓ {output_path} ({size/1024:.1f} KB)")

concat(MODULES,          'dist/style.min.css')
concat(HOMEPAGE_MODULES, 'dist/homepage.min.css')
concat(PROMPT_MODULES,   'dist/prompt-library.min.css')
print("Build complete.")
```

### Per-Page CSS Loading (Post-Build)

After running the build script, each page type loads exactly what it needs:

**Tool pages:**
```html
<link rel="stylesheet" href="dist/style.min.css?v=20">
```

**Homepage (index.html):**
```html
<link rel="stylesheet" href="dist/homepage.min.css?v=20">
```

**Prompt pages:**
```html
<link rel="stylesheet" href="dist/prompt-library.min.css?v=20">
```

### Benefits of This Approach

| Metric | Before (9 @imports) | After (1 bundle) |
|--------|--------------------|--------------------|
| CSS HTTP requests | 9 | 1 |
| First paint delay | Serialised downloads | Single download |
| Total CSS size | 70.6 KB (all pages) | ~40 KB per page type |
| Maintenance | Modular source files | Source unchanged |
| Build dependency | None | Python (already installed) |

## Transition Plan

**Phase 1.5 (current):** Keep @import in development. Document the strategy.

**Phase 5 (SEO + Performance pass):** Run `concat_css.py`, replace `@import` style.css with per-page `<link>` tags pointing to `dist/` bundles.

**Cloudflare Pages:** Add `build/concat_css.py` to the deploy command, or run locally before `git push`.

## Important Rule

**Never edit the files in `dist/`.** Always edit source files in `css/` and rebuild.
The `dist/` folder is gitignored and generated on every deployment.
