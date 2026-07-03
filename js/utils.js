/* ⚠ NOT LOADED IN ANY PAGE.
   RC2 note: tnFaqToggle() and the newsletter form handler that used to be
   proposed here now live in app.js instead (already loaded on homepage,
   category, and collection pages), so the site works without loading this
   file. Do NOT add a <script src="js/utils.js"> tag without first removing
   the duplicate tnFaqToggle()/initNewsletter() below — loading both this
   file and app.js would let whichever loads last silently override the
   other's FAQ/newsletter behavior.
   The remaining helpers here (showToast, copyEl, setStatus, scroll-fade,
   counters, back-to-top) are still an unwired Phase 4 proposal — see
   JS_MODULE_STRATEGY.md. */
/* ═══════════════════════════════════════════════════
   TOOLSNOVA — SHARED UTILITIES
   Toast, copy, status badge, FAQ, scroll animations,
   back-to-top, stat counters, service worker.
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── Toast notification ── */
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'copy-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg || 'Copied ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

/* ── Copy element content ── */
function copyEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.tagName === 'TEXTAREA' ? el.value : (el.innerText || el.textContent);
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(() => showToast('Copied ✓'));
}

/* ── Status badge ── */
function setStatus(id, cls, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'status-badge' + (cls ? ' ' + cls : '');
  el.textContent = msg;
}

/* ── FAQ accordion (tool pages, old style) ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-q').forEach(q => {
    if (q.dataset.faqBound) return;
    q.dataset.faqBound = '1';
    q.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      if (!item) return;
      // If it's the V2 aria-expanded style
      if (this.hasAttribute('aria-expanded')) return; // handled by tnFaqToggle
      item.classList.toggle('open');
    });
  });
});

/* ── FAQ accordion (homepage V2, aria style) ── */
function tnFaqToggle(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.faq-q[aria-expanded]').forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    const a = b.nextElementSibling;
    if (a) a.hidden = true;
  });
  if (!isOpen) {
    btn.setAttribute('aria-expanded', 'true');
    if (answer) answer.hidden = false;
  }
}

/* ── Scroll-fade animations ── */
function initScrollFade() {
  const els = document.querySelectorAll('.scroll-fade');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

/* ── Animated stat counters ── */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const elapsed  = Math.min(now - start, duration);
        const ease     = 1 - Math.pow(1 - elapsed / duration, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (elapsed < duration) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ── Back to top ── */
function initBackToTop() {
  const btn = document.getElementById('v2-back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Newsletter form ── */
function initNewsletter() {
  const form = document.getElementById('v2-newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button');
    if (!email || !email.value.includes('@')) return;
    if (btn) {
      btn.textContent = '✓ Subscribed!';
      btn.style.opacity = '0.7';
      btn.disabled = true;
    }
    email.value = '';
    setTimeout(() => {
      if (btn) { btn.textContent = 'Subscribe'; btn.style.opacity = ''; btn.disabled = false; }
    }, 3000);
  });
}

/* ── Service worker ── */
function initSW() {
  if ('serviceWorker' in navigator && location.hostname === 'toolsnova.net') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(r => console.log('[TN] SW:', r.scope))
        .catch(e => console.log('[TN] SW fail:', e));
    });
  }
}

/* ── Init on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollFade();
  initCounters();
  initBackToTop();
  initNewsletter();
});

/* ── Init SW on load ── */
initSW();

/* ── Expose globals ── */
window.showToast    = showToast;
window.copyEl       = copyEl;
window.setStatus    = setStatus;
window.tnFaqToggle  = tnFaqToggle;
