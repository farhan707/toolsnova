/* ⚠ NOT YET LOADED IN ANY PAGE — Phase 4 task.
   This is a reference implementation showing the target module structure.
   See JS_MODULE_STRATEGY.md for the wiring plan.
   Do not load this file in production until Phase 4 is complete. */
/* ═══════════════════════════════════════════════════
   TOOLSNOVA — THEME SYSTEM
   Light / Dark mode with localStorage persistence.
   Anti-flash inline script must run in <head>:
     <script>document.documentElement.setAttribute("data-theme",localStorage.getItem("tn-theme")||"dark")</script>
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── Inject header theme button on tool pages ── */
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
    if (navToggleBtn) {
      header.insertBefore(btn, navToggleBtn);
    } else {
      header.appendChild(btn);
    }
  }

  _updateToggleIcon(current);
});

/* ── Public API ── */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tn-theme', next);
  _updateToggleIcon(next);
}

function _updateToggleIcon(theme) {
  const isDark = theme === 'dark';

  // FAB
  const fab = document.getElementById('theme-toggle');
  if (fab) {
    fab.textContent = isDark ? '🌙' : '☀️';
    fab.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    fab.style.background = isDark ? '#141416' : '#ffffff';
    fab.style.color = isDark ? '#f0f0f2' : '#111112';
    fab.style.border = isDark ? '2px solid rgba(127,255,111,0.4)' : '2px solid rgba(26,138,10,0.4)';
  }

  // Header button (tool pages)
  const hbtn = document.getElementById('theme-toggle-header');
  if (hbtn) {
    hbtn.textContent = isDark ? '🌙' : '☀️';
    hbtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  // V2 nav button (homepage)
  const v2btn = document.getElementById('v2-theme-btn');
  if (v2btn) {
    v2btn.textContent = isDark ? '🌙' : '☀️';
  }
}

/* ── Expose globals ── */
window.toggleTheme = toggleTheme;
