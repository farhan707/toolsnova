/* ⚠ NOT YET LOADED IN ANY PAGE — Phase 4 task.
   This is a reference implementation showing the target module structure.
   See JS_MODULE_STRATEGY.md for the wiring plan.
   Do not load this file in production until Phase 4 is complete. */
/* ═══════════════════════════════════════════════════
   TOOLSNOVA — NAVIGATION
   Mobile nav toggle + homepage mega-menu support.
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── Tool page mobile nav ── */
function navToggle() {
  const nav = document.querySelector('.site-nav');
  const btn = document.querySelector('.nav-toggle');
  if (!nav) return;
  const open = nav.classList.toggle('open');
  if (btn) btn.textContent = open ? 'Close ✕' : 'Menu ☰';
}

/* ── Homepage V2 mobile nav ── */
function tnNavToggle() {
  const mn  = document.getElementById('v2-mobile-nav');
  const btn = document.getElementById('v2-hamburger');
  if (!mn) return;
  const open = mn.classList.toggle('open');
  if (btn) btn.textContent = open ? '✕' : '☰';
  document.body.style.overflow = open ? 'hidden' : '';
}

/* ── Close dropdown when clicking outside ── */
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    // Tool page nav
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.nav-toggle');
    if (nav && nav.classList.contains('open')) {
      if (!nav.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
        nav.classList.remove('open');
        if (toggle) toggle.textContent = 'Menu ☰';
      }
    }
    // V2 mobile nav
    const mobileNav = document.getElementById('v2-mobile-nav');
    const hamburger = document.getElementById('v2-hamburger');
    if (mobileNav && mobileNav.classList.contains('open')) {
      if (!mobileNav.contains(e.target) && (!hamburger || !hamburger.contains(e.target))) {
        mobileNav.classList.remove('open');
        if (hamburger) hamburger.textContent = '☰';
        document.body.style.overflow = '';
      }
    }
  });

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const mobileNav = document.getElementById('v2-mobile-nav');
    const hamburger = document.getElementById('v2-hamburger');
    if (mobileNav && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      if (hamburger) hamburger.textContent = '☰';
      document.body.style.overflow = '';
    }
    const nav = document.querySelector('.site-nav');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      const toggle = document.querySelector('.nav-toggle');
      if (toggle) toggle.textContent = 'Menu ☰';
    }
  });
});

/* ── Expose globals ── */
window.navToggle = navToggle;
window.tnNavToggle = tnNavToggle;
