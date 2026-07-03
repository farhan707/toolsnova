# ToolsNova — Page Generator Reference

> **Status:** Permanent project document, documented to the same standard as
> `ARCHITECTURE.md` and `CONTRIBUTING.md`. Read this before adding any new
> generated page type to ToolsNova.
>
> **File:** `pages_generator.py`
> **Introduced:** Phase 3.6

---

## 1. Purpose

`pages_generator.py` is ToolsNova's **long-term, extensible page-generation
framework**. It is a separate system from `generator.py` (the Prompt Library
generator, which owns `/prompts/**` and is explicitly protected — see
`ARCHITECTURE.md` §8 and the project's DO NOT TOUCH rules).

`pages_generator.py` currently generates:

- **Category pages** (`/developer-tools/`, `/finance-tools/`, etc.) — one per
  category discovered in `data/tools.json`
- **Collection pages** (`/collections/forex-trading/`, etc.) — one per entry
  in `data/collections.json`

It is designed so that adding a *new kind* of generated page (tags, AI model
profiles, author bios, content series, learning hubs) requires writing one
render function and registering it — never copy-pasting a whole new script.

**Golden rule, inherited from the rest of the project:** every generated page
must be driven by real JSON data. Never fabricate content. If the data source
for a page type doesn't exist yet, that page type stays an honest stub (see
§4) until real data exists.

---

## 2. Registry Architecture

The generator is built around one dictionary, `PAGE_TYPES`, near the bottom
of the file:

```python
PAGE_TYPES = {
    'category': {
        'data_file': 'tools.json',
        'active':    True,
    },
    'collection': {
        'data_file': 'collections.json',
        'active':    True,
    },
    'tag': {
        'data_file': 'tags.json',      # does not exist yet
        'render':    render_tag,
        'active':    False,
    },
    # ... model, author, series, learning_hub — same shape
}
```

Each entry describes one page type:

| Key | Meaning |
|---|---|
| `data_file` | Which file in `/data/` drives this page type |
| `render` | The template function that turns one item into HTML (category/collection currently call their render functions directly from `main()` rather than through this key, since their discovery logic differs slightly — see §3) |
| `active` | `True` if `main()` should actually build this page type. `False` means it's a documented placeholder — see §4 |

`main()` reads this registry, and only ever builds page types marked
`active: True`. Nothing here requires editing `main()`'s control flow to add
a page type in the common case — see §6 for the exact steps.

---

## 3. Current Supported Page Types

### 3.1 Category pages — `render_category()`

**Source of truth:** `data/tools.json`, grouped by each tool's `category`
field. Categories are **discovered**, never hardcoded:

```python
discovered_categories = sorted(
    set(t['category'] for t in tools),
    key=lambda c: -sum(1 for t in tools if t['category'] == c)
)
```

If a new category appears in `tools.json` tomorrow, it will be discovered
automatically. It only fails to generate a page if there's no entry for it in
`CATEGORY_SLUGS` (see below) — this is intentional, not a bug: it stops a
typo'd or unexpected category value from silently generating a broken URL,
and prints a `WARNING` instead.

**Current categories (12, as of Phase 3.6):**
Developer, Utilities, Finance, Health, Trading, Prop Firm, Students,
Converters, Fun, AI, Math, Construction.

**URL slug map** (`CATEGORY_SLUGS` dict): maps each category name to its URL
folder, e.g. `'Developer': 'developer-tools'`, `'Prop Firm':
'prop-firm-tools'`. Output: `{slug}/index.html` at the project root.

**Page contents:** hero (icon, name, tool count, description), live search
box, "Popular" grid (featured tools in that category, or first 4 if none are
featured), full tool grid (every tool in the category), related-categories
chip list (every other discovered category), FAQ (templated per category),
breadcrumb, canonical, Open Graph, Twitter Card, `BreadcrumbList` +
`FAQPage` schema.

### 3.2 Collection pages — `render_collection()`

**Source of truth:** `data/collections.json` directly — no derivation step.

**URL slug map** (`COLLECTION_SLUGS` dict): maps each collection's `id` to
its URL folder, e.g. `'forex-trading': 'forex-trading'`, `'developer-starter':
'developer-starter-pack'`. Output: `collections/{slug}/index.html`.

**Page contents:** hero (icon, name, tool count, description), full grid of
every tool listed in that collection's `tools` array (resolved against
`tools.json` for name/icon/description), related-collections chip list,
FAQ (auto-generated, lists the actual included tools by name), breadcrumb,
canonical, Open Graph, Twitter Card, `BreadcrumbList` + `CollectionPage` +
`FAQPage` schema.

---

## 4. Future Planned Page Types (stubs, not yet active)

These exist as documented stub functions with `active: False` in the
registry. Each raises `NotImplementedError` with a message explaining
exactly what's missing. **None of them fabricate data.**

| Type | Function | Blocked on |
|---|---|---|
| Tag pages | `render_tag()` | No `tags` field exists on tool/prompt records yet, and no `data/tags.json`. |
| AI Model pages | `render_model()` | `data/models.json` already exists, but it's currently owned by `generator.py`'s `/prompts/{model}/index.html` hubs. A future `render_model()` needs a non-colliding URL space (e.g. `/ai-models/`) before it can be wired in. |
| Author pages | `render_author()` | No `data/authors.json` — ToolsNova content isn't attributed to individual authors anywhere today. |
| Series pages | `render_series()` | No `data/series.json`. |
| Learning Hub pages | `render_learning_hub()` | No `data/learning-hubs.json`. |

To bring one of these online, see §6.

---

## 5. JSON Data Sources

| File | Used by | Notes |
|---|---|---|
| `data/tools.json` | Category pages | Also the source for the homepage's dynamic sections (`js/search.js`) — same single source of truth, two different consumers. |
| `data/collections.json` | Collection pages | Also read by `js/search.js` for the homepage's Popular Collections section. |
| `data/prompts.json` | *(not used by this generator)* | Owned by `generator.py`, the Prompt Library generator. Prompt categories (writing, seo, coding…) are a **separate taxonomy** from tool categories (Developer, Finance…) — never mix them. |
| `data/categories.json` | *(not used by this generator)* | This file holds the **prompt-library** category taxonomy, not tool categories. Do not repurpose it for category pages — see the note in `js/search.js`'s `renderCategories()` for the same distinction on the homepage side. |
| `data/tags.json`, `data/authors.json`, `data/series.json`, `data/learning-hubs.json`, `data/models.json`* | *(future)* | Do not exist yet (`models.json` exists but is owned by `generator.py` today). Create these only when the corresponding page type is actually implemented — never pre-populate with placeholder data. |

---

## 6. How to Add a New Page Type

Using `render_tag()` as the worked example:

**Step 1 — Create the data file**, e.g. `data/tags.json`, with real content.
Never generate a page type "to see how it looks" with fake data.

**Step 2 — Write the render function.** Follow the existing signature shape:

```python
def render_tag(tag, tag_items, all_tags):
    # tag        -> the tag name/id being rendered
    # tag_items  -> list of tools/prompts that carry this tag
    # all_tags   -> full list, for "related tags" links
    ...
    return f"""{page_head(...)}
{nav()}
<main>...</main>
{footer()}
</body></html>"""
```

Reuse the shared helpers already in the file: `page_head()`, `nav()`,
`footer()`, `tool_card()`, `faq_html()`, `schema_breadcrumb()`,
`schema_faq()`. Do not duplicate them.

**Step 3 — Flip the registry entry:**

```python
'tag': {
    'data_file': 'tags.json',
    'render':    render_tag,
    'active':    True,   # was False
},
```

**Step 4 — Add the build loop to `main()`.** Category and collection each
have their own explicit block in `main()` (rather than a fully generic loop)
because their discovery logic differs — category pages are *derived* by
grouping `tools.json`, while collection pages are *read directly* from
`collections.json`. Follow whichever pattern fits the new type's data shape,
using the existing `category`/`collection` blocks as templates.

**Step 5 — Add a URL slug map** if the type needs one (see
`CATEGORY_SLUGS` / `COLLECTION_SLUGS` for the pattern), and an output-path
convention consistent with the rest of the site.

**Step 6 — Verify in a real browser**, not just `--dry-run`. See
`CONTRIBUTING.md`'s testing checklist.

---

## 7. How to Run the Generator

```bash
python3 pages_generator.py                # build every active page type
python3 pages_generator.py --dry-run       # count pages, write nothing
python3 pages_generator.py --type category    # build only category pages
python3 pages_generator.py --type collection   # build only collection pages
```

`--type` only accepts currently-active types — inactive/stub types aren't
selectable until they're switched on per §6.

Run this after any change to `data/tools.json` or `data/collections.json` to
keep category and collection pages in sync. This is the same "regenerate,
don't hand-edit" discipline as `generator.py` for the Prompt Library — see
`CONTRIBUTING.md`.

---

## 8. Output Folder Structure

```
/
├── developer-tools/index.html
├── finance-tools/index.html
├── trading-tools/index.html
├── utilities/index.html
├── health-tools/index.html
├── student-tools/index.html
├── construction-tools/index.html
├── converter-tools/index.html
├── ai-tools/index.html
├── math-tools/index.html
├── prop-firm-tools/index.html
├── fun-tools/index.html
│
└── collections/
    ├── forex-trading/index.html
    ├── developer-starter-pack/index.html
    ├── ai-power-pack/index.html
    ├── student-toolkit/index.html
    └── finance-home/index.html
```

Every generated page lives one directory level below the site root, which is
why `page_head()`, `nav()`, and `footer()` all use `../` prefixes for
same-site asset links (`../style.css`, `../app.js`, `../index.html`, etc.) —
consistent with the depth-aware relative-path pattern established in
`generator.py` during Phase 3.5's file:// fix (see `CHANGELOG.md`).

---

## 9. Relationship to `generator.py`

| | `generator.py` | `pages_generator.py` |
|---|---|---|
| Owns | `/prompts/**`, `ai-prompt-library.html` | `/{category}/`, `/collections/**` |
| Data source | `data/prompts.json`, `data/categories.json`, `data/models.json` | `data/tools.json`, `data/collections.json` |
| Status | Protected — DO NOT TOUCH per project rules | Actively extensible per this document |

Both are static-site generators that share the same design philosophy (one
template, driven entirely by JSON, regenerate rather than hand-edit) but they
own strictly separate URL spaces and data sources. Do not let one generator's
logic reach into the other's territory — this is precisely the mistake
§5 warns against with `categories.json`.
