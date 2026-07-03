#!/usr/bin/env python3
"""
ToolsNova AI Prompt Library — Static Site Generator V3
=======================================================
Version: 3.0.0  (Phase 3 — unified platform integration)

ONE template. Everything generated from data/prompts.json.
All 576 prompt pages share the same head, nav, and footer.
Change the template → rebuild all pages with one command.

Usage:
  python3 generator.py                    # Build everything
  python3 generator.py --prompt slug      # Rebuild one prompt
  python3 generator.py --model chatgpt    # Rebuild one model's pages
  python3 generator.py --category seo     # Rebuild one category
  python3 generator.py --dry-run          # Count pages, no writes
  python3 generator.py --sitemap-only     # Regenerate sitemap only

Output:
  prompts/{model}/{slug}.html             # One page per model
  prompts/{model}/index.html             # Model hub
  prompts/{category}/index.html          # Category hub
  ai-prompt-library.html                 # Main hub
  sitemap-prompts.xml                    # Prompt sitemap
"""

import json, os, re, sys
from pathlib import Path
from datetime import datetime
from collections import Counter

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
OUT_DIR  = BASE_DIR / 'prompts'

# ── Site constants ────────────────────────────────────────────
SITE_URL = 'https://toolsnova.net'
GA_ID    = 'G-S6PPGS7N63'
ADSENSE  = 'ca-pub-5507557143792193'
VERSION  = '22'   # asset cache-bust version

# ── Helpers ───────────────────────────────────────────────────
def load_json(name):
    p = DATA_DIR / name if not str(name).startswith('/') else Path(name)
    with open(p, encoding='utf-8') as f:
        return json.load(f)

def save_html(path, html):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding='utf-8')

def he(s):
    """HTML-escape."""
    return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

# ── Model metadata ────────────────────────────────────────────
MODEL_META = {
    "chatgpt":  {"name":"ChatGPT",  "full":"ChatGPT (GPT-4o / GPT-5)",      "color":"#00a36c", "url":"https://chat.openai.com"},
    "claude":   {"name":"Claude",   "full":"Claude (Opus 4 / Sonnet 4)",     "color":"#d07f59", "url":"https://claude.ai"},
    "gemini":   {"name":"Gemini",   "full":"Gemini 2.0 Flash / Pro",         "color":"#4285f4", "url":"https://gemini.google.com"},
    "grok":     {"name":"Grok",     "full":"Grok 3",                         "color":"#909090", "url":"https://grok.x.ai"},
    "deepseek": {"name":"DeepSeek", "full":"DeepSeek V3 / R1",               "color":"#7f5af0", "url":"https://chat.deepseek.com"},
}

# ── Category metadata ─────────────────────────────────────────
CAT_META = {
    "writing":      {"label":"Writing",       "emoji":"✍️",  "color":"#7fff6f"},
    "seo":          {"label":"SEO",           "emoji":"🔍",  "color":"#ea4335"},
    "marketing":    {"label":"Marketing",     "emoji":"📣",  "color":"#ffa400"},
    "business":     {"label":"Business",      "emoji":"💼",  "color":"#4285f4"},
    "coding":       {"label":"Coding",        "emoji":"💻",  "color":"#7f5af0"},
    "trading":      {"label":"Trading",       "emoji":"📊",  "color":"#ffc800"},
    "education":    {"label":"Education",     "emoji":"📚",  "color":"#00a36c"},
    "social":       {"label":"Social Media",  "emoji":"📱",  "color":"#53aadd"},
    "productivity": {"label":"Productivity",  "emoji":"🚀",  "color":"#34d399"},
    "image":        {"label":"Image AI",      "emoji":"🎨",  "color":"#d07f59"},
    "finance":      {"label":"Finance",       "emoji":"💰",  "color":"#22d3ee"},
    "career":       {"label":"Career",        "emoji":"🎯",  "color":"#f472b6"},
}

DIFF_COLOR = {"Beginner":"#00a36c", "Intermediate":"#ffa400", "Advanced":"#ea4335"}

# ════════════════════════════════════════════════════════════════
#  V3 HEAD TEMPLATE
#  One function. All 576 pages share it.
#  Change this → rebuild → all pages updated.
# ════════════════════════════════════════════════════════════════
def v3_head(title, desc, canonical_path, og_title, og_desc, extra_schema=''):
    """
    Full V3 head standard — matches the 23-point checklist in ARCHITECTURE.md §10.
    All prompt pages call this. Only page-specific values differ.

    IMPORTANT: uses a depth-computed RELATIVE prefix (rel) for all same-site
    asset links (CSS, favicons, manifest) instead of leading-slash absolute
    paths. Leading-slash paths only resolve correctly when the site is served
    from true HTTP domain root; they silently 404 under file:// (opens
    relative to the filesystem root) and under any subpath deployment.
    Relative paths work in every context: file://, localhost, subpath
    hosting, and production domain root alike.
    """
    canonical_url = f"{SITE_URL}/{canonical_path}"
    rel_prefix = '../' * canonical_path.count('/')  # '' at root, '../../' two levels deep, etc.
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<!-- Anti-flash: must be first -->
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("tn-theme")||"dark")</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{he(title)}</title>
<meta name="description" content="{he(desc)}">
<link rel="canonical" href="{canonical_url}">

<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="{rel_prefix}favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="{rel_prefix}icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="{rel_prefix}icons/favicon-16.png">
<link rel="apple-touch-icon" href="{rel_prefix}icons/icon-192.png">

<!-- PWA -->
<link rel="manifest" href="{rel_prefix}manifest.json">
<meta name="theme-color" content="#7fff6f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ToolsNova">

<!-- Open Graph -->
<meta property="og:title" content="{he(og_title)}">
<meta property="og:description" content="{he(og_desc)}">
<meta property="og:url" content="{canonical_url}">
<meta property="og:type" content="website">
<meta property="og:image" content="{SITE_URL}/icons/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="ToolsNova">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{he(og_title)}">
<meta name="twitter:description" content="{he(og_desc)}">
<meta name="twitter:image" content="{SITE_URL}/icons/og-image.png">
<meta name="twitter:site" content="@toolsnova">

<!-- Schema -->
{extra_schema}

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Styles (shared platform CSS) -->
<link rel="stylesheet" href="{rel_prefix}style.css?v={VERSION}">
<link rel="stylesheet" href="{rel_prefix}css/prompt-library.css?v={VERSION}">

<!-- Analytics (not deferred — must fire on load) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');</script>

<!-- AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE}" crossorigin="anonymous"></script>
</head>"""


# ════════════════════════════════════════════════════════════════
#  V3 NAVIGATION  —  identical to production tool pages
#  Uses absolute /paths so it works in any subdirectory.
# ════════════════════════════════════════════════════════════════
V3_NAV = """<header class="site-header">
  <a href="/index.html" class="logo">Tools<span class="logo-dot">.</span>Nova</a>
  <button class="nav-toggle" onclick="navToggle()">Menu ☰</button>
  <nav class="site-nav" role="navigation" aria-label="Main">
    <span class="nav-category-label">🤖 AI Tools</span>
    <a href="/ai-prompt-library.html" class="nav-link">AI Prompt Library</a>
    <a href="/ai-prompt-studio.html" class="nav-link">Prompt Studio</a>
    <a href="/ai-token-counter.html" class="nav-link">Token Counter</a>
    <a href="/ai-api-cost-calculator.html" class="nav-link">API Cost Calc</a>
    <a href="/midjourney-prompt-builder.html" class="nav-link">Midjourney Builder</a>
    <div class="nav-divider" role="separator"></div>
    <span class="nav-category-label">Developer</span>
    <a href="/json-formatter.html" class="nav-link">JSON Formatter</a>
    <a href="/base64-encoder.html" class="nav-link">Base64 Encoder</a>
    <a href="/word-counter.html" class="nav-link">Word Counter</a>
    <a href="/regex-tester.html" class="nav-link">Regex Tester</a>
    <a href="/password-generator.html" class="nav-link">Password Generator</a>
    <a href="/markdown-editor.html" class="nav-link">Markdown Editor</a>
    <div class="nav-divider" role="separator"></div>
    <span class="nav-category-label">Finance</span>
    <a href="/mortgage-calculator.html" class="nav-link">Mortgage Calculator</a>
    <a href="/emi-calculator.html" class="nav-link">EMI Calculator</a>
    <a href="/compound-interest-calculator.html" class="nav-link">Compound Interest</a>
    <a href="/invoice-generator.html" class="nav-link">Invoice Generator</a>
    <div class="nav-divider" role="separator"></div>
    <span class="nav-category-label">Trading</span>
    <a href="/lot-size-calculator.html" class="nav-link">Lot Size</a>
    <a href="/risk-reward-calculator.html" class="nav-link">Risk:Reward</a>
    <a href="/gold-position-size-calculator.html" class="nav-link">Gold Position</a>
    <a href="/prop-firm-challenge-calculator.html" class="nav-link">Challenge Calc</a>
    <div class="nav-divider" role="separator"></div>
    <span class="nav-category-label">Health &amp; Utilities</span>
    <a href="/bmi-calculator.html" class="nav-link">BMI Calculator</a>
    <a href="/calorie-calculator.html" class="nav-link">Calorie Calculator</a>
    <a href="/age-calculator.html" class="nav-link">Age Calculator</a>
    <a href="/qr-code-generator.html" class="nav-link">QR Code Generator</a>
  </nav>
</header>"""


# ════════════════════════════════════════════════════════════════
#  V3 FOOTER  —  matches production footer exactly
# ════════════════════════════════════════════════════════════════
def v3_footer(rel_prefix=''):
    """
    Depth-aware footer. `rel_prefix` is the same relative-prefix computed in
    v3_head() ('' at root, '../../' two levels deep, etc). The app.js
    <script src> is the one truly load-bearing path here (it defines
    toggleTheme()/navToggle() that the page needs to be interactive) so
    it gets the relative treatment. Footer nav links stay absolute —
    they are cross-page navigation, not same-page resource loads, and
    fixing every one for file:// testing is out of scope for this pass.
    """
    return f"""<div class="copy-toast" id="toast"></div>
<footer class="site-footer">
  <span class="footer-copy">© 2026 ToolsNova — toolsnova.net — all processing in your browser</span>
  <nav class="footer-links" aria-label="Footer">
    <a href="/about.html">About</a>
    <a href="/contact.html">Contact</a>
    <a href="/privacy-policy.html">Privacy</a>
    <a href="/terms.html">Terms</a>
  </nav>
</footer>
<button id="theme-toggle" onclick="toggleTheme()" class="theme-toggle-fab" aria-label="Toggle theme"></button>
<script src="{rel_prefix}app.js?v={VERSION}" defer></script>
<script>

if('serviceWorker'in navigator&&location.hostname==='toolsnova.net'){{
  window.addEventListener('load',function(){{
    navigator.serviceWorker.register('/sw.js')
      .then(function(r){{console.log('[TN] SW:',r.scope);}})
      .catch(function(e){{console.log('[TN] SW fail:',e);}});
  }});
}}
</script>"""


# ════════════════════════════════════════════════════════════════
#  SCHEMA BUILDERS
# ════════════════════════════════════════════════════════════════
def schema_breadcrumb(items):
    """items = list of (name, url_path) tuples"""
    elements = [
        {"@type": "ListItem", "position": i+1, "name": name, "item": f"{SITE_URL}/{path}"}
        for i, (name, path) in enumerate(items)
    ]
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": elements
    }, ensure_ascii=False)

def schema_faq(faqs):
    items = [
        {"@type": "Question", "name": f['q'], "acceptedAnswer": {"@type": "Answer", "text": f['a']}}
        for f in faqs if 'q' in f and 'a' in f
    ]
    if not items:
        return ""
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items
    }, ensure_ascii=False)

def schema_creative_work(prompt, model_name, canonical_path, meta_desc):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": f"{model_name} {prompt['title']} Prompt",
        "description": meta_desc,
        "url": f"{SITE_URL}/{canonical_path}",
        "dateModified": prompt.get('last_updated', '2026-06-30'),
        "author": {"@type": "Organization", "name": "ToolsNova", "url": SITE_URL},
        "isAccessibleForFree": True,
        "keywords": ", ".join(prompt.get('tags', []))
    }, ensure_ascii=False)

def schema_webapp(name, url_path, desc):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": name,
        "url": f"{SITE_URL}/{url_path}",
        "description": desc,
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
    }, ensure_ascii=False)


# ════════════════════════════════════════════════════════════════
#  PROMPT PAGE BUILDER
#  One function. One template. All 576 pages.
# ════════════════════════════════════════════════════════════════
def build_prompt_page(prompt, model, all_prompts):
    m    = MODEL_META.get(model, {"name": model.title(), "full": model.title(), "color": "#7fff6f", "url": "https://chat.openai.com"})
    cat  = CAT_META.get(prompt['category'], {"label": prompt['category'].title(), "emoji": "📄", "color": "#7fff6f"})
    slug = prompt['slug']
    canonical_path = f"prompts/{model}/{slug}.html"
    rel_prefix = '../' * canonical_path.count('/')

    # SEO fields
    seo_title = prompt.get('seo_title') or f"{m['name']} {prompt['title']} Prompt — Free | ToolsNova"
    meta_desc = prompt.get('meta_description') or \
        f"Free {prompt['title'].lower()} prompt for {m['name']}. Copy, fill variables, get professional output instantly. No signup required."
    og_title  = f"{m['name']} {prompt['title']} Prompt"
    short_desc = prompt.get('short_description', '')

    # Schema
    bc_items = [
        ("ToolsNova", ""),
        ("AI Prompt Library", "ai-prompt-library.html"),
        (m['name'], f"prompts/{model}/index.html"),
        (cat['label'], f"prompts/{prompt['category']}/index.html"),
        (prompt['title'], canonical_path),
    ]
    bc_schema  = schema_breadcrumb(bc_items)
    cw_schema  = schema_creative_work(prompt, m['name'], canonical_path, meta_desc)
    faq_s      = schema_faq(prompt.get('faqs', []))
    faq_script = f'<script type="application/ld+json">{faq_s}</script>' if faq_s else ''

    extra_schema = f"""<script type="application/ld+json">{bc_schema}</script>
<script type="application/ld+json">{cw_schema}</script>
{faq_script}"""

    # ── Breadcrumb HTML ──────────────────────────────────────────
    bc_html = f"""<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="/index.html">ToolsNova</a><span class="breadcrumb-sep">›</span>
  <a href="/ai-prompt-library.html">Prompt Library</a><span class="breadcrumb-sep">›</span>
  <a href="/prompts/{prompt['category']}/index.html">{cat['emoji']} {cat['label']}</a><span class="breadcrumb-sep">›</span>
  <a href="/prompts/{model}/index.html">{m['name']}</a><span class="breadcrumb-sep">›</span>
  <span>{he(prompt['title'])}</span>
</nav>"""

    # ── Badges ───────────────────────────────────────────────────
    diff       = prompt.get('difficulty', 'Intermediate')
    cat_badge  = f'<span class="badge badge-{prompt["category"]}">{cat["emoji"]} {cat["label"]}</span>'
    diff_badge = f'<span class="badge badge-{diff.lower()}">{diff}</span>'
    tag_badges = " ".join(f'<span class="badge" style="background:var(--surface3);color:var(--text3)">{he(t)}</span>'
                          for t in (prompt.get('tags') or [])[:4])
    model_pills = " ".join(
        f'<span class="model-pill pill-{mid}">{MODEL_META.get(mid, {"name": mid.title()})["name"]}</span>'
        for mid in prompt.get('supported_models', [])
    )

    # ── Variable editor ──────────────────────────────────────────
    vars_html = ""
    if prompt.get('variables'):
        eg = prompt.get('example_input', {})
        var_inputs = "\n".join(
            f'<div class="var-group"><label>{he(v)}</label>'
            f'<input class="var-input" type="text" placeholder="{he(str(eg.get(v, v)))}"'
            f' oninput="updatePrompt()" data-var="{he(v)}"></div>'
            for v in prompt['variables']
        )
        vars_html = f"""<div class="var-builder">
<span class="section-label">⚙️ Fill in your variables</span>
<div class="var-grid">{var_inputs}</div>
<button class="paction paction-secondary" onclick="resetVars()" style="font-size:.75rem;padding:.3rem .7rem">↺ Reset variables</button>
</div>"""

    # ── Prompt text ──────────────────────────────────────────────
    raw_text  = he(prompt.get('prompt_text', ''))
    hl_text   = re.sub(r'\[([^\]]+)\]', r'<span class="var-hl">[\1]</span>', raw_text)
    prompt_display = hl_text.replace('\n', '<br>')

    # ── Tips & mistakes ──────────────────────────────────────────
    tips_html     = "\n".join(f'<div class="tip-card">{he(t)}</div>' for t in (prompt.get('tips') or []))
    mistakes_html = "\n".join(f'<div class="mistake-card">{he(t)}</div>' for t in (prompt.get('common_mistakes') or []))

    # ── Example output ───────────────────────────────────────────
    eg_out = he(prompt.get('example_output', ''))
    example_section = (
        f'<span class="section-label">📄 Example output</span>\n'
        f'<div class="example-box">{eg_out.replace(chr(10), "<br>")}</div>'
    ) if eg_out else ''

    # ── FAQ accordion ────────────────────────────────────────────
    faq_items_html = "".join(
        f'<li class="faq-item"><div class="faq-q" onclick="this.classList.toggle(\'open\');this.nextElementSibling.classList.toggle(\'open\')">'
        f'{he(f["q"])}</div><div class="faq-a">{he(f["a"])}</div></li>'
        for f in (prompt.get('faqs') or [])
    )

    # ── Related prompts ──────────────────────────────────────────
    slug_map = {p['slug']: p for p in all_prompts}
    related_cards = ""
    for rel_slug in (prompt.get('related_prompts') or [])[:4]:
        rel = slug_map.get(rel_slug)
        if not rel:
            continue
        rel_cat  = CAT_META.get(rel['category'], {"emoji": "📄", "label": rel['category'].title()})
        rel_model = (rel.get('supported_models') or ['chatgpt'])[0]
        related_cards += (
            f'<a class="related-card" href="/prompts/{rel_model}/{rel_slug}.html">'
            f'<div class="rc-title">{he(rel["title"])}</div>'
            f'<div class="rc-cat">{rel_cat["emoji"]} {rel_cat["label"]}</div></a>'
        )

    # ── Model switcher ───────────────────────────────────────────
    model_switcher = ""
    for alt_model in (prompt.get('supported_models') or []):
        cls   = "model-link active" if alt_model == model else "model-link"
        alt_m = MODEL_META.get(alt_model, {"name": alt_model.title(), "color": "#7fff6f"})
        style = f'border-color:{alt_m["color"]};color:{alt_m["color"]}' if alt_model == model else ''
        model_switcher += (
            f'<a class="{cls}" href="/prompts/{alt_model}/{slug}.html"'
            f'{" style=\"" + style + "\"" if style else ""}>{alt_m["name"]}</a>'
        )

    # ── Best model box ───────────────────────────────────────────
    bm_id = prompt.get('best_model', 'chatgpt')
    bm    = MODEL_META.get(bm_id, {"name": bm_id.title(), "full": bm_id.title(), "color": "#7fff6f"})
    bm_color = bm.get('color', 'var(--accent)')

    # ── Recently viewed JS data ──────────────────────────────────
    prompt_js_data = json.dumps(prompt.get('prompt_text', ''), ensure_ascii=False)

    page_js = f"""<script>
/* ── Prompt interactive logic ── */
const PROMPT_RAW = {prompt_js_data};
let userVals = {{}};

function updatePrompt() {{
  document.querySelectorAll('.var-input').forEach(inp => {{
    userVals[inp.getAttribute('data-var')] = inp.value.trim();
  }});
  let t = PROMPT_RAW;
  Object.entries(userVals).forEach(([k, v]) => {{ if (v) t = t.replaceAll('[' + k + ']', v); }});
  const box = document.getElementById('prompt-display');
  box.innerHTML = t.replace(/\\[([^\\]]+)\\]/g, '<span class="var-hl">[$1]</span>').replace(/\\n/g, '<br>');
}}

function resetVars() {{
  document.querySelectorAll('.var-input').forEach(inp => inp.value = '');
  userVals = {{}};
  const box = document.getElementById('prompt-display');
  box.innerHTML = PROMPT_RAW.replace(/\\[([^\\]]+)\\]/g, '<span class="var-hl">[$1]</span>').replace(/\\n/g, '<br>');
}}

function copyPrompt() {{
  let t = PROMPT_RAW;
  Object.entries(userVals).forEach(([k, v]) => {{ if (v) t = t.replaceAll('[' + k + ']', v); }});
  navigator.clipboard.writeText(t).then(() => showToast('✓ Prompt copied!'));
}}

function openInModel() {{
  let t = PROMPT_RAW;
  Object.entries(userVals).forEach(([k, v]) => {{ if (v) t = t.replaceAll('[' + k + ']', v); }});
  navigator.clipboard.writeText(t);
  window.open('{m['url']}', '_blank');
}}

/* ── Favourites ── */
const FAV_KEY = 'pl-favs';
let favs = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const SLUG = '{slug}';

function updateFavBtn() {{
  const btn = document.getElementById('fav-btn');
  if (!btn) return;
  const on = favs.includes(SLUG);
  btn.textContent = on ? '⭐ Saved' : '☆ Save';
  btn.classList.toggle('active', on);
}}

function toggleFav() {{
  const i = favs.indexOf(SLUG);
  if (i === -1) favs.push(SLUG); else favs.splice(i, 1);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  updateFavBtn();
}}

/* ── Recently viewed ── */
(function() {{
  const RV_KEY = 'pl-recent';
  let rv = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
  rv = [SLUG, ...rv.filter(x => x !== SLUG)].slice(0, 12);
  localStorage.setItem(RV_KEY, JSON.stringify(rv));
}})();

updateFavBtn();
</script>"""

    # ── Full page HTML ───────────────────────────────────────────
    head = v3_head(seo_title, meta_desc, canonical_path, og_title, meta_desc, extra_schema)

    return f"""{head}
<body>
{V3_NAV}
<main>
  <div class="page-hero">
    <div class="breadcrumb" aria-label="Breadcrumb">
      <a href="/index.html">ToolsNova</a><span class="breadcrumb-sep">›</span>
      <a href="/ai-prompt-library.html">Prompt Library</a><span class="breadcrumb-sep">›</span>
      <a href="/prompts/{prompt['category']}/index.html">{cat['emoji']} {cat['label']}</a><span class="breadcrumb-sep">›</span>
      <a href="/prompts/{model}/index.html">{m['name']}</a><span class="breadcrumb-sep">›</span>
      <span>{he(prompt['title'])}</span>
    </div>
    <h1>{m['name']} {he(prompt['title'])} Prompt</h1>
    <p>{he(short_desc)}</p>
  </div>

  <div class="stats-row" style="max-width:860px;margin:0 2rem 1rem">
    <div class="stat-card">
      <div class="stat-label">Category</div>
      <div class="stat-value" style="font-size:1rem">{cat['emoji']} {cat['label']}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Difficulty</div>
      <div class="stat-value" style="font-size:1rem;color:{DIFF_COLOR.get(diff, '#7fff6f')}">{diff}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Models</div>
      <div class="stat-value" style="font-size:.85rem">{len(prompt.get('supported_models', []))}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Last Updated</div>
      <div class="stat-value" style="font-size:.8rem">{prompt.get('last_updated', '2026-06-30')}</div>
    </div>
  </div>

  <div style="max-width:860px;margin:0 2rem;padding-bottom:3rem">

    <div class="toolbar" style="margin-bottom:1rem">
      {cat_badge} {diff_badge} {tag_badges}
    </div>

    <span class="pane-label">Works with</span>
    <div class="model-switcher" style="display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:1.2rem">
      {model_switcher}
    </div>

    {vars_html}

    <span class="pane-label">📋 Prompt</span>
    <div class="prompt-box-wrap" style="position:relative;margin-bottom:.75rem">
      <div class="prompt-box" id="prompt-display" contenteditable="true">{prompt_display}</div>
    </div>
    <div class="toolbar" style="margin-bottom:1.5rem">
      <button class="btn primary" onclick="copyPrompt()">📋 Copy Prompt</button>
      <button class="btn" onclick="openInModel()">↗ Open in {m['name']}</button>
      <button class="btn paction-fav" id="fav-btn" onclick="toggleFav()">☆ Save</button>
    </div>

    {example_section}

    <div class="stat-card" style="margin-bottom:1.25rem;display:flex;gap:.75rem;align-items:center">
      <span style="font-size:1.5rem">🏆</span>
      <div>
        <div class="stat-label">Best model for this prompt</div>
        <div style="font-size:.95rem;font-weight:700;color:{bm_color}">{bm['name']}</div>
        <div style="font-size:.75rem;color:var(--text3)">{bm.get('full','')}</div>
      </div>
    </div>

    <span class="pane-label">💡 Pro Tips</span>
    <div class="two-col-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:1.25rem">
      {tips_html}
    </div>

    <span class="pane-label">⚠️ Common Mistakes</span>
    <div class="two-col-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:1.25rem">
      {mistakes_html}
    </div>

    <span class="pane-label">❓ FAQ</span>
    <ul class="faq-list" style="list-style:none;padding:0;margin:0 0 1.25rem">{faq_items_html}</ul>

    <span class="pane-label">🔗 Related Prompts</span>
    <div class="related-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.65rem;margin-bottom:2rem">
      {related_cards}
    </div>

  </div>
</main>
{v3_footer(rel_prefix)}
{page_js}
</body></html>"""


# ════════════════════════════════════════════════════════════════
#  MODEL HUB  — e.g. prompts/chatgpt/index.html
# ════════════════════════════════════════════════════════════════
def build_model_hub(model, model_prompts, all_prompts, categories):
    m   = MODEL_META.get(model, {"name": model.title(), "full": model.title(), "color": "#7fff6f", "url": "#"})
    canonical_path = f"prompts/{model}/index.html"
    rel_prefix = '../' * canonical_path.count('/')
    title = f"Free {m['name']} Prompts — {len(model_prompts)}+ Expert Prompts | ToolsNova"
    desc  = f"Browse {len(model_prompts)}+ free expert {m['name']} prompts. Writing, SEO, coding, trading, business, and more. Copy and use instantly — no signup."
    og    = f"Free {m['name']} Prompts — ToolsNova AI Prompt Library"

    bc_schema = schema_breadcrumb([
        ("ToolsNova", ""),
        ("AI Prompt Library", "ai-prompt-library.html"),
        (m['name'], canonical_path),
    ])

    # Group by category
    cat_groups = {}
    for p in model_prompts:
        cat_groups.setdefault(p['category'], []).append(p)

    cat_chips = "".join(
        f'<a class="chip-link" href="/prompts/{cid}/index.html">{CAT_META.get(cid, {"emoji":"📄"})["emoji"]} {CAT_META.get(cid, {"label": cid.title()})["label"]} ({len(cps)})</a>'
        for cid, cps in sorted(cat_groups.items(), key=lambda x: -len(x[1]))
    )

    cards = ""
    for p in model_prompts:
        cat  = CAT_META.get(p['category'], {"emoji": "📄", "label": p['category'].title()})
        diff = p.get('difficulty', 'Intermediate')
        sd   = (p.get('short_description') or p['title'])[:110]
        cards += (
            f'<a class="prompt-card" href="/prompts/{model}/{p["slug"]}.html">'
            f'<div class="card-title">{he(p["title"])}</div>'
            f'<div class="card-desc">{he(sd)}</div>'
            f'<div class="card-footer">'
            f'<span class="badge badge-{p["category"]}">{cat["emoji"]} {cat["label"]}</span>'
            f'<span class="badge badge-{diff.lower()}">{diff}</span>'
            f'</div></a>'
        )

    extra_schema = f'<script type="application/ld+json">{bc_schema}</script>'
    head = v3_head(title, desc, canonical_path, og, desc, extra_schema)

    return f"""{head}
<body>
{V3_NAV}
<main>
  <div class="page-hero">
    <nav class="breadcrumb">
      <a href="/index.html">ToolsNova</a><span class="breadcrumb-sep">›</span>
      <a href="/ai-prompt-library.html">AI Prompt Library</a><span class="breadcrumb-sep">›</span>
      <span>{m['name']}</span>
    </nav>
    <h1>{m['name']} Prompts</h1>
    <p>Browse {len(model_prompts)}+ free expert {m['name']} prompts. Copy, fill variables, and get professional results instantly — no account required.</p>
  </div>
  <div style="padding:0 2rem 3rem">
    <span class="pane-label">Browse by category</span>
    <div class="chip-links" style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.2rem">{cat_chips}</div>
    <span class="pane-label">All {m['name']} Prompts ({len(model_prompts)})</span>
    <div class="prompt-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:.75rem">{cards}</div>
  </div>
</main>
{v3_footer(rel_prefix)}
</body></html>"""


# ════════════════════════════════════════════════════════════════
#  CATEGORY HUB  — e.g. prompts/seo/index.html
# ════════════════════════════════════════════════════════════════
def build_category_hub(cat_id, cat_prompts, all_prompts, models):
    cat  = CAT_META.get(cat_id, {"emoji": "📄", "label": cat_id.title(), "color": "#7fff6f"})
    canonical_path = f"prompts/{cat_id}/index.html"
    rel_prefix = '../' * canonical_path.count('/')
    title = f"Best {cat['label']} AI Prompts for ChatGPT & Claude — Free | ToolsNova"
    desc  = f"Browse {len(cat_prompts)}+ free {cat['label'].lower()} AI prompts for ChatGPT, Claude, Gemini, and more. Professional quality — copy and use instantly."
    og    = f"Free {cat['label']} AI Prompts — ToolsNova"

    bc_schema = schema_breadcrumb([
        ("ToolsNova", ""),
        ("AI Prompt Library", "ai-prompt-library.html"),
        (cat['label'], canonical_path),
    ])

    cards = ""
    for p in cat_prompts:
        diff        = p.get('difficulty', 'Intermediate')
        first_model = (p.get('supported_models') or ['chatgpt'])[0]
        sd          = (p.get('short_description') or p['title'])[:110]
        model_tags  = "".join(
            f'<span class="badge" style="background:var(--surface3);color:var(--text3)">{MODEL_META.get(mid, {"name": mid.title()})["name"]}</span>'
            for mid in (p.get('supported_models') or [])[:3]
        )
        cards += (
            f'<a class="prompt-card" href="/prompts/{first_model}/{p["slug"]}.html">'
            f'<div class="card-title">{he(p["title"])}</div>'
            f'<div class="card-desc">{he(sd)}</div>'
            f'<div class="card-footer">'
            f'<span class="badge badge-{diff.lower()}">{diff}</span>'
            f'{model_tags}'
            f'</div></a>'
        )

    extra_schema = f'<script type="application/ld+json">{bc_schema}</script>'
    head = v3_head(title, desc, canonical_path, og, desc, extra_schema)

    return f"""{head}
<body>
{V3_NAV}
<main>
  <div class="page-hero">
    <nav class="breadcrumb">
      <a href="/index.html">ToolsNova</a><span class="breadcrumb-sep">›</span>
      <a href="/ai-prompt-library.html">AI Prompt Library</a><span class="breadcrumb-sep">›</span>
      <span>{cat['emoji']} {cat['label']}</span>
    </nav>
    <h1>{cat['emoji']} {cat['label']} AI Prompts</h1>
    <p>Browse {len(cat_prompts)}+ free professional {cat['label'].lower()} prompts for ChatGPT, Claude, Gemini and more. Copy and use in seconds.</p>
  </div>
  <div style="padding:0 2rem 3rem">
    <span class="pane-label">All {cat['label']} Prompts ({len(cat_prompts)})</span>
    <div class="prompt-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:.75rem">{cards}</div>
  </div>
</main>
{v3_footer(rel_prefix)}
</body></html>"""


# ════════════════════════════════════════════════════════════════
#  AI PROMPT LIBRARY HUB  — ai-prompt-library.html
# ════════════════════════════════════════════════════════════════
def build_main_hub(all_prompts, categories, models_data):
    total          = len(all_prompts)
    canonical_path = "ai-prompt-library.html"
    rel_prefix = '../' * canonical_path.count('/')
    title = f"AI Prompt Library — {total}+ Free Prompts for ChatGPT, Claude & Gemini | ToolsNova"
    desc  = f"Free AI prompt library with {total}+ professional prompts for ChatGPT, Claude, Gemini, Grok and DeepSeek. Writing, SEO, coding, trading, business, education and more."
    og    = f"AI Prompt Library — {total}+ Free AI Prompts | ToolsNova"

    app_schema = schema_webapp("AI Prompt Library", canonical_path, desc)
    extra_schema = f'<script type="application/ld+json">{app_schema}</script>'
    head = v3_head(title, desc, canonical_path, og, desc, extra_schema)

    # Category grid
    cat_counts = Counter(p['category'] for p in all_prompts)
    cat_grid = ""
    for c in categories:
        cat   = CAT_META.get(c['id'], {"emoji": "📄", "label": c['id'].title()})
        count = cat_counts.get(c['id'], 0)
        cat_grid += (
            f'<a class="cat-card-v2" href="/prompts/{c["id"]}/index.html">'
            f'<div class="cat-card-icon">{cat["emoji"]}</div>'
            f'<div class="cat-card-name">{cat["label"]}</div>'
            f'<div class="cat-card-count">{count} prompts</div>'
            f'<div class="cat-card-desc">{c.get("description", "Professional AI prompts")}</div>'
            f'<div class="cat-card-link">View all →</div></a>'
        )

    # Model links
    model_links = ""
    for m_data in models_data:
        m     = MODEL_META.get(m_data['id'], {"name": m_data['id'].title(), "color": "#7fff6f"})
        count = sum(1 for p in all_prompts if m_data['id'] in p.get('supported_models', []))
        model_links += (
            f'<a class="tool-card" href="/prompts/{m_data["id"]}/index.html" style="border-color:{m["color"]}33">'
            f'<div class="tool-icon" style="color:{m["color"]}">{m["name"]}</div>'
            f'<div class="tool-name">{count} prompts</div>'
            f'<div class="tool-desc">Browse all {m["name"]} prompts →</div></a>'
        )

    # Featured prompts
    featured = [p for p in all_prompts if p.get('featured')][:6]
    if not featured:
        featured = all_prompts[:6]
    feat_cards = ""
    for p in featured:
        cat         = CAT_META.get(p['category'], {"emoji": "📄", "label": p['category'].title()})
        first_model = (p.get('supported_models') or ['chatgpt'])[0]
        sd          = (p.get('short_description') or p['title'])[:100]
        diff        = p.get('difficulty', 'Intermediate')
        feat_cards += (
            f'<a class="prompt-card" href="/prompts/{first_model}/{p["slug"]}.html">'
            f'<div class="card-title">{he(p["title"])}</div>'
            f'<div class="card-desc">{he(sd)}</div>'
            f'<div class="card-footer">'
            f'<span class="badge badge-{p["category"]}">{cat["emoji"]} {cat["label"]}</span>'
            f'<span class="badge badge-{diff.lower()}">{diff}</span>'
            f'</div></a>'
        )

    # Recently added (last 8 by ID)
    recent = sorted(all_prompts, key=lambda p: p.get('id', 0), reverse=True)[:8]
    recent_cards = ""
    for p in recent:
        cat         = CAT_META.get(p['category'], {"emoji": "📄", "label": p['category'].title()})
        first_model = (p.get('supported_models') or ['chatgpt'])[0]
        sd          = (p.get('short_description') or p['title'])[:100]
        recent_cards += (
            f'<a class="prompt-card" href="/prompts/{first_model}/{p["slug"]}.html">'
            f'<div class="card-title">{he(p["title"])}</div>'
            f'<div class="card-desc">{he(sd)}</div>'
            f'<div class="card-footer"><span class="badge badge-{p["category"]}">{cat["emoji"]} {cat["label"]}</span></div></a>'
        )

    # Search index for client-side hub search
    search_idx = json.dumps([
        {"slug": p["slug"], "title": p["title"], "category": p["category"],
         "short_description": p.get("short_description", ""),
         "supported_models": p.get("supported_models", [])}
        for p in all_prompts
    ], ensure_ascii=False)

    hub_js = f"""<script>
const ALL_PROMPTS = {search_idx};
const CAT_ICONS = {json.dumps({k: v['emoji'] for k, v in CAT_META.items()}, ensure_ascii=False)};
const FEATURED_HTML = document.getElementById('hub-prompts').innerHTML;

function hubSearch(q) {{
  const el = document.getElementById('hub-prompts');
  if (!q) {{ el.innerHTML = FEATURED_HTML; return; }}
  const lq = q.toLowerCase();
  const matches = ALL_PROMPTS.filter(p =>
    p.title.toLowerCase().includes(lq) ||
    p.category.toLowerCase().includes(lq) ||
    (p.short_description || '').toLowerCase().includes(lq)
  ).slice(0, 24);
  if (!matches.length) {{
    el.innerHTML = '<p style="color:var(--text3);font-family:var(--mono);font-size:.82rem;padding:1rem 0">No prompts found for "' + q + '"</p>';
    return;
  }}
  el.innerHTML = matches.map(p => {{
    const model = (p.supported_models || ['chatgpt'])[0];
    const icon  = CAT_ICONS[p.category] || '📄';
    const sd    = (p.short_description || '').slice(0, 100);
    return '<a class="prompt-card" href="/prompts/' + model + '/' + p.slug + '.html">'
      + '<div class="card-title">' + p.title + '</div>'
      + '<div class="card-desc">' + sd + '</div>'
      + '<div class="card-footer"><span class="badge badge-' + p.category + '">' + icon + ' ' + p.category + '</span></div>'
      + '</a>';
  }}).join('');
}}
</script>"""

    return f"""{head}
<body>
{V3_NAV}
<main>
  <div class="page-hero">
    <div class="hero-badge">📚 AI Prompt Library</div>
    <h1 class="hero-h1">Professional AI Prompts.<br><span class="hero-h1-accent">{total}+ Templates. Free.</span></h1>
    <p class="hero-sub">Copy-paste prompts for ChatGPT, Claude, Gemini, Grok and DeepSeek. Writing, coding, SEO, trading, business and more. No signup required.</p>
    <div class="hero-search-wrap" style="margin-top:1.5rem;max-width:560px">
      <span class="hero-search-icon">🔍</span>
      <input class="hero-search" type="search" id="hub-search-input"
        placeholder="Search {total}+ prompts..." oninput="hubSearch(this.value)">
    </div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Browse</div><h2 class="section-title">By Model</h2></div>
    </div>
    <div class="tools-grid" style="max-width:1280px;margin:0 auto">{model_links}</div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Explore</div><h2 class="section-title">Browse by Category</h2></div>
    </div>
    <div class="categories-grid-5" style="max-width:1280px;margin:0 auto">{cat_grid}</div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">Featured</div><h2 class="section-title">Popular Prompts</h2></div>
    </div>
    <div id="hub-prompts" class="prompt-grid" style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:.75rem">
      {feat_cards}
    </div>
  </div>

  <div class="v2-section">
    <div class="section-header">
      <div><div class="section-eyebrow">New</div><h2 class="section-title">Recently Added</h2></div>
    </div>
    <div class="prompt-grid" style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:.75rem">
      {recent_cards}
    </div>
  </div>

</main>
{v3_footer(rel_prefix)}
{hub_js}
</body></html>"""


# ════════════════════════════════════════════════════════════════
#  SITEMAP
# ════════════════════════════════════════════════════════════════
def build_sitemap(all_prompts, models_data, categories):
    today = datetime.now().strftime('%Y-%m-%d')
    urls  = [f"{SITE_URL}/ai-prompt-library.html"]
    for m in models_data:
        urls.append(f"{SITE_URL}/prompts/{m['id']}/index.html")
    for cat in categories:
        urls.append(f"{SITE_URL}/prompts/{cat['id']}/index.html")
    for p in all_prompts:
        for model in p.get('supported_models', []):
            urls.append(f"{SITE_URL}/prompts/{model}/{p['slug']}.html")
    entries = "\n".join(
        f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{today}</lastmod>\n"
        f"    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>"
        for url in urls
    )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{entries}
</urlset>"""


# ════════════════════════════════════════════════════════════════
#  MAIN
# ════════════════════════════════════════════════════════════════
def main():
    import argparse
    parser = argparse.ArgumentParser(description='ToolsNova Prompt Library Generator V3')
    parser.add_argument('--prompt',       help='Rebuild specific prompt slug only')
    parser.add_argument('--model',        help='Rebuild specific model only')
    parser.add_argument('--category',     help='Rebuild specific category only')
    parser.add_argument('--dry-run',      action='store_true', help='Count pages, no file writes')
    parser.add_argument('--sitemap-only', action='store_true', help='Regenerate sitemap only')
    args = parser.parse_args()
    dry  = args.dry_run

    # Load data
    prompts    = load_json('prompts.json')
    categories = load_json('categories.json')
    models_raw = load_json('models.json')

    slug_set     = {p['slug'] for p in prompts}
    target_slugs = {args.prompt} if args.prompt else None
    target_models = {args.model} if args.model else {m['id'] for m in models_raw}
    target_cats   = {args.category} if args.category else {c['id'] for c in categories}

    prompt_count = 0
    model_count  = 0
    cat_count    = 0

    if args.sitemap_only:
        sm = build_sitemap(prompts, models_raw, categories)
        (BASE_DIR / 'sitemap-prompts.xml').write_text(sm, encoding='utf-8')
        print(f"Sitemap written ({len(urls := sm.count('<url>'))}) URLs")
        return

    # Build prompt pages
    for p in prompts:
        if target_slugs and p['slug'] not in target_slugs:
            continue
        for model in p.get('supported_models', []):
            if model not in target_models:
                continue
            path = BASE_DIR / 'prompts' / model / f"{p['slug']}.html"
            if not dry:
                save_html(path, build_prompt_page(p, model, prompts))
            prompt_count += 1

    # Build model hubs
    for model in target_models:
        m_prompts = [p for p in prompts if model in p.get('supported_models', [])]
        path = BASE_DIR / 'prompts' / model / 'index.html'
        if not dry:
            save_html(path, build_model_hub(model, m_prompts, prompts, categories))
        model_count += 1

    # Build category hubs
    for cat_id in target_cats:
        c_prompts = [p for p in prompts if p['category'] == cat_id]
        path = BASE_DIR / 'prompts' / cat_id / 'index.html'
        if not dry:
            save_html(path, build_category_hub(cat_id, c_prompts, prompts, models_raw))
        cat_count += 1

    # Build main hub + sitemap (only on full build)
    if not args.prompt and not args.model and not args.category:
        if not dry:
            save_html(BASE_DIR / 'ai-prompt-library.html',
                      build_main_hub(prompts, categories, models_raw))
            sm = build_sitemap(prompts, models_raw, categories)
            (BASE_DIR / 'sitemap-prompts.xml').write_text(sm, encoding='utf-8')

    print(f"\n{'[DRY RUN] ' if dry else ''}Build complete:")
    print(f"  Prompt pages : {prompt_count}")
    print(f"  Model hubs   : {model_count}")
    print(f"  Category hubs: {cat_count}")
    print(f"  Main hub     : {'yes' if not (args.prompt or args.model or args.category) else 'skipped'}")
    print(f"  Sitemap      : {'yes' if not (args.prompt or args.model or args.category) else 'skipped'}")
    if not dry:
        print(f"\n  Output: {BASE_DIR}")

if __name__ == '__main__':
    main()
