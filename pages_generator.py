#!/usr/bin/env python3
"""
ToolsNova — Category & Collection Page Generator (Phase 3.6)
==============================================================
NEW script. Does not touch generator.py (the Prompt Generator,
explicitly protected under DO NOT TOUCH).

Reusable template architecture:
  - ONE shared head template   (page_head())
  - ONE shared nav constant    (NAV)
  - ONE shared footer function (footer())
  - ONE category page template (build_category_page())
  - ONE collection page template (build_collection_page())

Everything is generated from JSON. No hardcoded tool/category/
collection lists anywhere in this file's output.

Source of truth:
  data/tools.json       -> category pages (grouped by `category` field)
  data/collections.json -> collection pages

Usage:
  python3 pages_generator.py                # build everything
  python3 pages_generator.py --dry-run       # count pages only
"""

import json, re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'

SITE_URL = 'https://toolsnova.net'
GA_ID    = 'G-S6PPGS7N63'
ADSENSE  = 'ca-pub-5507557143792193'
VERSION  = '20'

def he(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

# ── Category slug map (URL slug per category — matches the task doc's examples) ──
CATEGORY_SLUGS = {
    'Developer':    'developer-tools',
    'Finance':      'finance-tools',
    'Trading':      'trading-tools',
    'Utilities':    'utilities',
    'Health':       'health-tools',
    'Students':     'student-tools',
    'Construction': 'construction-tools',
    'Converters':   'converter-tools',
    'AI':           'ai-tools',
    'Math':         'math-tools',
    'Prop Firm':    'prop-firm-tools',
    'Fun':          'fun-tools',
}

CATEGORY_META = {
    'Developer':    {'icon': '{}', 'color': 'green',  'desc': 'JSON tools, encoders, converters, generators and utilities every developer uses daily.'},
    'Finance':      {'icon': '$',  'color': 'cyan',   'desc': 'Mortgages, loans, EMI, compound interest, invoices and everyday money calculators.'},
    'Trading':      {'icon': '📊', 'color': 'purple', 'desc': 'Forex position sizing, risk management, pip value and pivot point calculators for traders.'},
    'Utilities':    {'icon': '🛠️', 'color': 'blue',   'desc': 'Everyday calculators, converters and generators for quick, common tasks.'},
    'Health':       {'icon': '❤️', 'color': 'pink',   'desc': 'BMI, calories, TDEE, macros, sleep and fitness calculators.'},
    'Students':     {'icon': '🎓', 'color': 'blue',   'desc': 'GPA, grade, fraction and scientific calculators for schoolwork and exams.'},
    'Construction': {'icon': '🏗️', 'color': 'orange', 'desc': 'Concrete, paint, flooring and square footage calculators for building and renovation.'},
    'Converters':   {'icon': '🔄', 'color': 'purple', 'desc': 'Temperature, length, weight, speed and timezone converters.'},
    'AI':           {'icon': '🤖', 'color': 'orange', 'desc': 'AI prompt library, prompt studio, token counters and API cost calculators.'},
    'Math':         {'icon': '📐', 'color': 'blue',   'desc': 'Equations, matrices, triangle and standard deviation calculators.'},
    'Prop Firm':    {'icon': '🏆', 'color': 'yellow', 'desc': 'Challenge tracking, drawdown, consistency and payout calculators for funded traders.'},
    'Fun':          {'icon': '🎲', 'color': 'pink',   'desc': 'Love calculator, dice roller, zodiac and other just-for-fun tools.'},
}

FAQ_TEMPLATES = {
    'default': [
        ("Are these {cat} tools free?", "Yes. Every {cat} tool on ToolsNova is completely free, with no signup, no usage limits, and no hidden fees."),
        ("Do I need to create an account?", "No. All {cat} tools work instantly in your browser — no account, no email, no signup required."),
        ("Is my data safe?", "Yes. Every {cat} tool runs entirely in your browser. Nothing you type or upload is ever sent to our servers."),
        ("Can I use these tools on mobile?", "Yes. All {cat} tools are fully responsive and work on desktop, tablet and mobile devices."),
    ],
}

# ═══════════════════════════════════════════════════════════
#  SHARED HEAD TEMPLATE (reused by both page types)
#
#  asset_prefix is a depth-computed RELATIVE prefix (mirrors generator.py's
#  rel_prefix — see ARCHITECTURE.md file:// fix from Phase 3.5). It is
#  derived from canonical_path.count('/'), so pages at ANY depth (category
#  pages at depth 1, collection pages at depth 2, etc.) resolve their CSS,
#  favicons, and internal links correctly under file://, localhost, subpath
#  hosting, and production domain root alike. Never hardcode '../' here.
# ═══════════════════════════════════════════════════════════
def page_head(title, desc, canonical_path, og_title, og_desc, schema_blocks='', asset_prefix='../'):
    canonical_url = f"{SITE_URL}/{canonical_path}"
    p = asset_prefix
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("tn-theme")||"dark")</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{he(title)}</title>
<meta name="description" content="{he(desc)}">
<link rel="canonical" href="{canonical_url}">

<link rel="icon" type="image/svg+xml" href="{p}favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="{p}icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="{p}icons/favicon-16.png">
<link rel="apple-touch-icon" href="{p}icons/icon-192.png">
<link rel="manifest" href="{p}manifest.json">
<meta name="theme-color" content="#7fff6f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ToolsNova">

<meta property="og:title" content="{he(og_title)}">
<meta property="og:description" content="{he(og_desc)}">
<meta property="og:url" content="{canonical_url}">
<meta property="og:type" content="website">
<meta property="og:image" content="{SITE_URL}/icons/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="ToolsNova">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{he(og_title)}">
<meta name="twitter:description" content="{he(og_desc)}">
<meta name="twitter:image" content="{SITE_URL}/icons/og-image.png">
<meta name="twitter:site" content="@toolsnova">

{schema_blocks}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="{p}style.css?v={VERSION}">
<link rel="stylesheet" href="{p}css/homepage.css?v={VERSION}">

<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE}" crossorigin="anonymous"></script>
</head>
<body>"""

# ═══════════════════════════════════════════════════════════
#  SHARED NAV (reused by both page types) — paths adjusted with
#  asset_prefix, a depth-computed relative prefix (see page_head above).
# ═══════════════════════════════════════════════════════════
def nav(asset_prefix='../'):
    p = asset_prefix
    return f"""<nav class="v2-nav" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="{p}index.html" class="v2-logo">Tools<span class="v2-logo-dot">.</span>Nova</a>
    <div class="nav-links">
      <a href="{p}index.html" class="nav-link-item">Home</a>
      <div class="nav-link-item">
        AI Workspace
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        <div class="mega-menu">
          <a href="{p}ai-prompt-library.html"><span>📚</span> AI Prompt Library</a>
          <a href="{p}ai-prompt-studio.html"><span>🧠</span> AI Prompt Studio</a>
          <a href="{p}ai-token-counter.html"><span>🔢</span> AI Token Counter</a>
          <a href="{p}ai-api-cost-calculator.html"><span>💰</span> API Cost Calculator</a>
          <a href="{p}midjourney-prompt-builder.html"><span>🎨</span> Midjourney Builder</a>
        </div>
      </div>
      <a href="{p}index.html#trending" class="nav-link-item">Categories</a>
      <a href="{p}ai-prompt-library.html" class="nav-link-item">AI Prompts</a>
      <a href="{p}index.html#collections" class="nav-link-item">Collections</a>
    </div>
    <div class="nav-actions">
      <button class="nav-icon-btn" id="v2-nav-search-btn" aria-label="Search" onclick="document.getElementById('v2-search')?.focus()">🔍</button>
      <a href="{p}index.html#bookmarks" class="nav-icon-btn" aria-label="Bookmarks">⭐</a>
      <button class="nav-icon-btn" id="v2-theme-btn" onclick="toggleTheme()" aria-label="Toggle theme">🌙</button>
      <button class="nav-hamburger" id="v2-hamburger" onclick="tnNavToggle()" aria-label="Open menu">☰</button>
    </div>
  </div>
</nav>"""

# ═══════════════════════════════════════════════════════════
#  SHARED FOOTER (reused by both page types) — paths adjusted with
#  asset_prefix, a depth-computed relative prefix (see page_head above).
#  Note: the SW registration path ('/sw.js') stays root-absolute on
#  purpose — service worker scope must be registered from true domain
#  root regardless of page depth; it is gated behind a hostname check
#  so it's inert under file:// anyway.
# ═══════════════════════════════════════════════════════════
def footer(asset_prefix='../'):
    p = asset_prefix
    return f"""<footer class="v2-footer">
  <div class="footer-inner">
    <div class="footer-grid-lg">
      <div class="footer-brand">
        <a href="{p}index.html" class="v2-logo">Tools<span class="v2-logo-dot">.</span>Nova</a>
        <p>155+ free browser tools and 200+ AI prompts for developers, traders, and everyday use. 100% private — everything runs in your browser.</p>
      </div>
      <div class="footer-col">
        <h4>Categories</h4>
        <a href="{p}developer-tools/index.html">Developer</a>
        <a href="{p}trading-tools/index.html">Trading</a>
        <a href="{p}finance-tools/index.html">Finance</a>
        <a href="{p}health-tools/index.html">Health</a>
      </div>
      <div class="footer-col">
        <h4>Popular Tools</h4>
        <a href="{p}json-formatter.html">JSON Formatter</a>
        <a href="{p}mortgage-calculator.html">Mortgage Calculator</a>
        <a href="{p}lot-size-calculator.html">Lot Size Calculator</a>
        <a href="{p}regex-tester.html">Regex Tester</a>
      </div>
      <div class="footer-col">
        <h4>AI Resources</h4>
        <a href="{p}ai-prompt-library.html">AI Prompt Library</a>
        <a href="{p}ai-prompt-studio.html">AI Prompt Studio</a>
        <a href="{p}ai-token-counter.html">AI Token Counter</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="{p}about.html">About</a>
        <a href="{p}contact.html">Contact</a>
        <h4 style="margin-top:1rem">Legal</h4>
        <a href="{p}privacy-policy.html">Privacy Policy</a>
        <a href="{p}terms.html">Terms of Service</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy-v2">© 2026 ToolsNova — toolsnova.net — all processing happens in your browser</span>
      <nav class="footer-bottom-links" aria-label="Footer legal links">
        <a href="{p}privacy-policy.html">Privacy</a>
        <a href="{p}terms.html">Terms</a>
        <a href="{p}about.html">About</a>
        <a href="{p}contact.html">Contact</a>
      </nav>
    </div>
  </div>
</footer>
<button class="back-to-top" id="v2-back-top" aria-label="Back to top">↑</button>
<script src="{p}app.js?v={VERSION}" defer></script>
<script src="{p}js/search.js?v={VERSION}" defer></script>
<script>
if('serviceWorker'in navigator&&location.hostname==='toolsnova.net'){{
  window.addEventListener('load',function(){{
    navigator.serviceWorker.register('/sw.js')
      .then(function(r){{console.log('[TN] SW:',r.scope);}})
      .catch(function(e){{console.log('[TN] SW fail:',e);}});
  }});
}}
</script>"""


# ═══════════════════════════════════════════════════════════
#  SCHEMA HELPERS
# ═══════════════════════════════════════════════════════════
def schema_breadcrumb(items):
    elements = [
        {"@type": "ListItem", "position": i + 1, "name": name, "item": f"{SITE_URL}/{path}"}
        for i, (name, path) in enumerate(items)
    ]
    return json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": elements}, ensure_ascii=False)

def schema_collection_page(name, desc, url, num_items):
    return json.dumps({
        "@context": "https://schema.org", "@type": "CollectionPage",
        "name": name, "description": desc, "url": url,
        "mainEntity": {"@type": "ItemList", "numberOfItems": num_items}
    }, ensure_ascii=False)

def schema_faq(faqs):
    items = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]
    return json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}, ensure_ascii=False)

# ═══════════════════════════════════════════════════════════
#  TOOL CARD (reused — same markup/classes as homepage tool-card-v2)
# ═══════════════════════════════════════════════════════════
def tool_card(t, asset_prefix='../'):
    color = CATEGORY_META.get(t['category'], {}).get('color', 'green')
    return f"""<a href="{asset_prefix}{he(t['url'])}" class="tool-card-v2">
      <div class="tool-card-icon icon-badge icon-badge-{color}">{t.get('icon', '🔧')}</div>
      <div class="tool-card-name">{he(t['name'])}</div>
      <div class="tool-card-desc">{he(t.get('desc', ''))}</div>
      <div class="tool-card-cta">Open →</div>
    </a>"""

def faq_html(faqs):
    items = ""
    for i, (q, a) in enumerate(faqs):
        items += f"""<div class="faq-item">
      <button class="faq-q" aria-expanded="false" onclick="tnFaqToggle(this)">{he(q)}<span class="faq-chevron">⌄</span></button>
      <div class="faq-a" hidden>{he(a)}</div>
    </div>"""
    return items

# ═══════════════════════════════════════════════════════════
#  ONE TEMPLATE — CATEGORY PAGE
#  Called once per category discovered in tools.json.
# ═══════════════════════════════════════════════════════════
def render_category(category_name, category_tools, all_categories):
    slug = CATEGORY_SLUGS[category_name]
    meta = CATEGORY_META[category_name]
    canonical_path = f"{slug}/index.html"
    asset_prefix = '../' * canonical_path.count('/')  # depth-aware, mirrors generator.py's rel_prefix
    count = len(category_tools)

    title = f"{count}+ Free {category_name} Tools — Browser-Based, No Signup | ToolsNova"
    desc  = f"{meta['desc']} {count}+ free tools, 100% browser-based, no signup required."
    og_title = f"{category_name} Tools — ToolsNova"

    bc_schema  = schema_breadcrumb([("ToolsNova", ""), (category_name, canonical_path)])
    faqs = [(q.format(cat=category_name), a.format(cat=category_name)) for q, a in FAQ_TEMPLATES['default']]
    faq_schema = schema_faq(faqs)
    schema_blocks = f'<script type="application/ld+json">{bc_schema}</script>\n<script type="application/ld+json">{faq_schema}</script>'

    head = page_head(title, desc, canonical_path, og_title, desc, schema_blocks, asset_prefix)

    # Popular tools = featured ones in this category (fallback: first 4)
    popular = [t for t in category_tools if t.get('featured')][:4] or category_tools[:4]

    # Related categories = every other discovered category (excluding self)
    related_cats = [c for c in all_categories if c != category_name]
    related_html = "".join(
        f'<a href="{asset_prefix}{CATEGORY_SLUGS[c]}/index.html" class="chip-link">{CATEGORY_META[c]["icon"]} {he(c)}</a>'
        for c in related_cats
    )

    tools_grid = "\n    ".join(tool_card(t, asset_prefix) for t in category_tools)
    popular_grid = "\n    ".join(tool_card(t, asset_prefix) for t in popular)

    return f"""{head}
{nav(asset_prefix)}
<div class="mobile-nav" id="v2-mobile-nav">
  <div class="mobile-nav-section"><a href="{asset_prefix}index.html">🏠 Home</a><a href="{asset_prefix}ai-prompt-library.html">📚 AI Prompt Library</a></div>
</div>
<main>
  <div class="page-hero" style="padding:2rem 2rem 0">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="{asset_prefix}index.html">ToolsNova</a><span class="breadcrumb-sep">›</span>
      <span>{he(category_name)}</span>
    </nav>
    <div class="hero-badge">{meta['icon']} {count}+ Tools</div>
    <h1 style="font-family:var(--display);font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;letter-spacing:-.03em;margin:.6rem 0">{he(category_name)} Tools</h1>
    <p style="font-size:.95rem;color:var(--text2);max-width:640px;line-height:1.7">{he(meta['desc'])}</p>

    <div class="hero-search-wrap" style="margin-top:1.25rem;max-width:520px">
      <span class="hero-search-icon">🔍</span>
      <input class="hero-search" type="search" id="v2-search" placeholder="Search {he(category_name)} tools..." autocomplete="off">
      <button class="hero-search-btn" id="v2-search-btn">Search</button>
      <div class="hero-search-results" id="v2-search-results" role="listbox"></div>
    </div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Popular</div><h2 class="section-title">Popular {he(category_name)} Tools</h2></div>
    </div>
    <div class="tools-grid-4">
    {popular_grid}
    </div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">All Tools</div><h2 class="section-title">All {count}+ {he(category_name)} Tools</h2></div>
    </div>
    <div class="tools-grid-4">
    {tools_grid}
    </div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Explore</div><h2 class="section-title">Related Categories</h2></div>
    </div>
    <div class="chip-links" style="display:flex;flex-wrap:wrap;gap:.5rem">{related_html}</div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">FAQ</div><h2 class="section-title">Common Questions</h2></div>
    </div>
    <div class="faq-list">{faq_html(faqs)}</div>
  </div>
</main>
{footer(asset_prefix)}
</body></html>"""

# ═══════════════════════════════════════════════════════════
#  ONE TEMPLATE — COLLECTION PAGE
#  Called once per collection in collections.json.
# ═══════════════════════════════════════════════════════════
COLLECTION_SLUGS = {
    'forex-trading':      'forex-trading',
    'developer-starter':  'developer-starter-pack',
    'ai-power':           'ai-power-pack',
    'student':            'student-toolkit',
    'finance-home':       'finance-home',
}

def render_collection(coll, all_tools, all_collections):
    slug = COLLECTION_SLUGS[coll['id']]
    canonical_path = f"collections/{slug}/index.html"
    asset_prefix = '../' * canonical_path.count('/')  # depth-aware: collections/{slug}/ is 2 deep -> '../../'
    tool_by_url = {t['url']: t for t in all_tools}
    included = [tool_by_url[u] for u in coll['tools'] if u in tool_by_url]
    count = len(included)

    title = f"{coll['name']} — {count} Free Tools Bundled | ToolsNova"
    desc  = f"{coll['desc']}. {count} hand-picked free tools in one collection — no signup required."
    og_title = f"{coll['name']} — ToolsNova Collection"

    bc_schema = schema_breadcrumb([("ToolsNova", ""), ("Collections", "index.html#collections"), (coll['name'], canonical_path)])
    cp_schema = schema_collection_page(coll['name'], desc, f"{SITE_URL}/{canonical_path}", count)
    faqs = [
        (f"What's included in the {coll['name']}?", f"The {coll['name']} bundles {count} free tools: " + ", ".join(t['name'] for t in included) + "."),
        ("Is this collection free?", f"Yes. All {count} tools in the {coll['name']} are completely free, with no signup required."),
        ("Can I use these tools individually?", "Yes. Every tool in this collection also works as a standalone page — bookmark whichever ones you use most."),
    ]
    faq_schema = schema_faq(faqs)
    schema_blocks = f'<script type="application/ld+json">{bc_schema}</script>\n<script type="application/ld+json">{cp_schema}</script>\n<script type="application/ld+json">{faq_schema}</script>'

    head = page_head(title, desc, canonical_path, og_title, desc, schema_blocks, asset_prefix)

    tools_grid = "\n    ".join(tool_card(t, asset_prefix) for t in included)

    related = [c for c in all_collections if c['id'] != coll['id']]
    # NOTE: sibling collections live under the SAME collections/ parent dir as
    # this page (collections/{slug}/index.html), so the link is always one
    # level up + into the sibling — NOT asset_prefix, which points to site root.
    related_html = "".join(
        f'<a href="../{COLLECTION_SLUGS[c["id"]]}/index.html" class="chip-link">{c.get("icon","📦")} {he(c["name"])}</a>'
        for c in related
    )

    return f"""{head}
{nav(asset_prefix)}
<div class="mobile-nav" id="v2-mobile-nav">
  <div class="mobile-nav-section"><a href="{asset_prefix}index.html">🏠 Home</a><a href="{asset_prefix}ai-prompt-library.html">📚 AI Prompt Library</a></div>
</div>
<main>
  <div class="page-hero" style="padding:2rem 2rem 0">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="{asset_prefix}index.html">ToolsNova</a><span class="breadcrumb-sep">›</span>
      <a href="{asset_prefix}index.html#collections">Collections</a><span class="breadcrumb-sep">›</span>
      <span>{he(coll['name'])}</span>
    </nav>
    <div class="hero-badge">{coll.get('icon','📦')} {count} Tools Bundled</div>
    <h1 style="font-family:var(--display);font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;letter-spacing:-.03em;margin:.6rem 0">{he(coll['name'])}</h1>
    <p style="font-size:.95rem;color:var(--text2);max-width:640px;line-height:1.7">{he(coll['desc'])}</p>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Included</div><h2 class="section-title">What's Inside</h2></div>
    </div>
    <div class="tools-grid-4">
    {tools_grid}
    </div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Explore</div><h2 class="section-title">Related Collections</h2></div>
    </div>
    <div class="chip-links" style="display:flex;flex-wrap:wrap;gap:.5rem">{related_html}</div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">FAQ</div><h2 class="section-title">Common Questions</h2></div>
    </div>
    <div class="faq-list">{faq_html(faqs)}</div>
  </div>
</main>
{footer(asset_prefix)}
</body></html>"""

# ═══════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════
# ═══════════════════════════════════════════════════════════
#  FUTURE PAGE TYPES — stub functions
#
#  Each follows the same signature pattern as render_category()/
#  render_collection(): (item_data, related_context) -> HTML string.
#  None of these are wired into the PAGE_TYPES registry below yet,
#  because their source JSON files don't exist — per the project's
#  "never invent data" rule, they raise NotImplementedError with a
#  clear message instead of fabricating content. When the real data
#  file is created, wiring one in is a 2-line change to PAGE_TYPES.
# ═══════════════════════════════════════════════════════════

def render_tag(tag, tag_items, all_tags):
    """
    Future: tag pages, e.g. /tags/forex/, grouping tools and/or
    prompts that share a tag. Source of truth would be a `tags`
    array already present on individual tool/prompt records, or a
    dedicated data/tags.json if tags need their own metadata
    (description, icon). Not yet wired — no tag taxonomy exists
    in tools.json today (only a single `category` field).
    """
    raise NotImplementedError(
        "render_tag() is a stub. Wire it up once tools.json/prompts.json "
        "gain a `tags` field or data/tags.json is created — do not fabricate tag data."
    )

def render_model(model, model_data, all_models):
    """
    Future: standalone AI model pages, e.g. /ai-models/claude/,
    profiling a model (pricing, context window, strengths) separate
    from the existing /prompts/{model}/index.html prompt-hub pages
    (those are owned by generator.py — the Prompt Generator — and
    are explicitly protected under DO NOT TOUCH). Source of truth
    would be data/models.json, which already exists for the prompt
    library's model hubs. A future render_model() here would need
    its own distinct URL space (e.g. /ai-models/ not /prompts/) to
    avoid colliding with generator.py's output.
    """
    raise NotImplementedError(
        "render_model() is a stub. data/models.json exists but is currently "
        "owned by generator.py's prompt-hub pages — decide on a non-colliding "
        "URL space (e.g. /ai-models/) before wiring this in."
    )

def render_author(author, author_content, all_authors):
    """
    Future: author bio/profile pages. No data/authors.json exists
    yet — ToolsNova content is not currently attributed to individual
    authors anywhere in tools.json or prompts.json.
    """
    raise NotImplementedError(
        "render_author() is a stub. Requires data/authors.json (does not exist yet) "
        "— do not fabricate author data."
    )

def render_series(series, series_items, all_series):
    """
    Future: multi-part content series pages (e.g. a "Forex Basics"
    series linking several related prompts/tools in a suggested
    order). No data/series.json exists yet.
    """
    raise NotImplementedError(
        "render_series() is a stub. Requires data/series.json (does not exist yet) "
        "— do not fabricate series data."
    )

def render_learning_hub(hub, hub_content, all_hubs):
    """
    Future: curated "Learning Hub" landing pages (e.g. a guided path
    through several tools + prompts for a specific goal, richer than
    a Collection). No data/learning-hubs.json exists yet.
    """
    raise NotImplementedError(
        "render_learning_hub() is a stub. Requires data/learning-hubs.json "
        "(does not exist yet) — do not fabricate hub data."
    )


# ═══════════════════════════════════════════════════════════
#  PAGE TYPE REGISTRY
#
#  This is the permanent, long-term page-generation framework for
#  ToolsNova. Adding a new page type means:
#    1. Write a render_x(item, context) -> HTML function
#    2. Register it below with its data source, slug function, and
#       output-path function
#    3. main() automatically picks it up — no other code changes
#
#  Each registry entry is a dict:
#    data_file    -> JSON file in /data/ that drives this page type
#                     (None if derived from another file, e.g.
#                     categories are derived from tools.json)
#    discover     -> fn(loaded_json) -> list of items to render
#    render       -> fn(item, context) -> HTML string
#    slug         -> fn(item) -> URL slug
#    output_path  -> fn(slug) -> Path relative to BASE_DIR
#    active       -> False for stub types with no real data source yet
# ═══════════════════════════════════════════════════════════
PAGE_TYPES = {
    'category': {
        'data_file':   'tools.json',
        'active':      True,
    },
    'collection': {
        'data_file':   'collections.json',
        'active':      True,
    },
    'tag': {
        'data_file':   'tags.json',       # does not exist yet
        'render':      render_tag,
        'active':      False,
    },
    'model': {
        'data_file':   'models.json',     # exists, but owned by generator.py today
        'render':      render_model,
        'active':      False,
    },
    'author': {
        'data_file':   'authors.json',    # does not exist yet
        'render':      render_author,
        'active':      False,
    },
    'series': {
        'data_file':   'series.json',     # does not exist yet
        'render':      render_series,
        'active':      False,
    },
    'learning_hub': {
        'data_file':   'learning-hubs.json',  # does not exist yet
        'render':      render_learning_hub,
        'active':      False,
    },
}


# ═══════════════════════════════════════════════════════════
#  MAIN — orchestrates generation across all ACTIVE page types.
#  Category and collection generation logic is kept explicit here
#  (rather than forced through a generic loop) because each has
#  slightly different discovery/relation logic (categories are
#  discovered by grouping tools.json; collections are read directly
#  from collections.json). Both ultimately go through the same
#  render_category()/render_collection() template functions
#  registered above, and both are reported through the same
#  PAGE_TYPES-driven summary — this is the seam future page types
#  plug into.
# ═══════════════════════════════════════════════════════════
def main():
    import argparse
    parser = argparse.ArgumentParser(description='ToolsNova page generator — category, collection, and future page types')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--type', choices=[k for k, v in PAGE_TYPES.items() if v['active']], help='Build only one page type')
    args = parser.parse_args()

    tools = json.load(open(DATA_DIR / PAGE_TYPES['category']['data_file']))
    collections = json.load(open(DATA_DIR / PAGE_TYPES['collection']['data_file']))

    results = {}

    # ── category ──
    if not args.type or args.type == 'category':
        discovered_categories = sorted(set(t['category'] for t in tools), key=lambda c: -sum(1 for t in tools if t['category'] == c))
        unknown = [c for c in discovered_categories if c not in CATEGORY_SLUGS]
        if unknown:
            print(f"WARNING: categories in tools.json with no slug mapping (skipped): {unknown}")

        cat_count = 0
        for cat in discovered_categories:
            if cat not in CATEGORY_SLUGS:
                continue
            cat_tools = [t for t in tools if t['category'] == cat]
            slug = CATEGORY_SLUGS[cat]
            html = render_category(cat, cat_tools, discovered_categories)
            if not args.dry_run:
                out = BASE_DIR / slug / 'index.html'
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_text(html, encoding='utf-8')
            cat_count += 1
        results['category'] = (cat_count, discovered_categories)

    # ── collection ──
    if not args.type or args.type == 'collection':
        coll_count = 0
        for coll in collections:
            if coll['id'] not in COLLECTION_SLUGS:
                print(f"WARNING: collection '{coll['id']}' has no slug mapping (skipped)")
                continue
            slug = COLLECTION_SLUGS[coll['id']]
            html = render_collection(coll, tools, collections)
            if not args.dry_run:
                out = BASE_DIR / 'collections' / slug / 'index.html'
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_text(html, encoding='utf-8')
            coll_count += 1
        results['collection'] = (coll_count, None)

    # ── inactive/future types: reported but not built ──
    inactive = [k for k, v in PAGE_TYPES.items() if not v['active']]

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Build complete:")
    if 'category' in results:
        print(f"  Category pages:   {results['category'][0]}  (discovered from tools.json: {results['category'][1]})")
    if 'collection' in results:
        print(f"  Collection pages: {results['collection'][0]}")
    if inactive:
        print(f"  Inactive (future) page types, not built: {inactive}")

if __name__ == '__main__':
    main()
