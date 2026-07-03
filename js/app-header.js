/* ═══════════════════════════════════════════════════════════════
   TOOLSNOVA — MASTER APP SCRIPT
   Version: 3.0.0
   
   This file is the single script tag on all tool pages:
     <script src="app.js?v=20"></script>
   
   IMPORTANT: All tool functions (JSON, regex, base64, trading,
   finance etc.) remain in this file UNCHANGED.
   The shared utilities (theme, nav, toast, FAQ) are now also
   in separate /js/ modules but duplicated here for backward
   compatibility with all existing tool pages.
   
   Phase 2+ will progressively refactor individual functions
   into /js/ modules with script type="module".
   For now: zero breaking changes.
   ═══════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   THEME SYSTEM
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const header = document.querySelector('.site-header');
  const navToggleBtn = document.querySelector('.nav-toggle');
  if (header && !document.getElementById('theme-toggle-header')) {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-header';
    btn.className = 'theme-toggle-header-btn';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.onclick = toggleTheme;
    if (navToggleBtn) { header.insertBefore(btn, navToggleBtn); }
    else { header.appendChild(btn); }
  }
  _updateToggleIcon(current);
});

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tn-theme', next);
  _updateToggleIcon(next);
}

function _updateToggleIcon(theme) {
  const fab = document.getElementById('theme-toggle');
  if (fab) {
    fab.textContent = theme === 'dark' ? '🌙' : '☀️';
    fab.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (theme === 'light') { fab.style.background='#ffffff'; fab.style.color='#111112'; fab.style.border='2px solid rgba(26,138,10,0.4)'; }
    else { fab.style.background='#141416'; fab.style.color='#f0f0f2'; fab.style.border='2px solid rgba(127,255,111,0.4)'; }
  }
  const hbtn = document.getElementById('theme-toggle-header');
  if (hbtn) { hbtn.textContent = theme === 'dark' ? '🌙' : '☀️'; hbtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'; }
}

/* ════════════════════════════════════
   SHARED UTILITIES
   ════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg || 'Copied ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}
function copyEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.tagName === 'TEXTAREA' ? el.value : (el.innerText || el.textContent);
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(() => showToast('Copied ✓'));
}
function setStatus(id, cls, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'status-badge' + (cls ? ' ' + cls : '');
  el.textContent = msg;
}
function navToggle() {
  const nav = document.querySelector('.site-nav');
  const btn = document.querySelector('.nav-toggle');
  if (!nav) return;
  const open = nav.classList.toggle('open');
  if (btn) btn.textContent = open ? 'Close ✕' : 'Menu ☰';
}

/* ════════════════════════════════════
   ████ ALL TOOL FUNCTIONS BELOW ████
   Unchanged from production v19.
   ════════════════════════════════════ */
