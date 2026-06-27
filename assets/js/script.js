/* =====================================================================
   RAICHEM · BRAND BOOK — interazioni
   Nav mobile · scroll-spy · barra di avanzamento · reveal on-scroll
   ===================================================================== */
(function () {
  'use strict';

  const nav      = document.getElementById('nav');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const progress = document.getElementById('progress');
  const toTop    = document.getElementById('toTop');
  const links    = Array.from(navLinks.querySelectorAll('a'));

  /* ---------- Menu mobile ---------- */
  toggle.addEventListener('click', function () {
    const aperto = nav.classList.toggle('aperto');
    toggle.setAttribute('aria-expanded', String(aperto));
    toggle.setAttribute('aria-label', aperto ? 'Chiudi menu' : 'Apri menu');
  });

  // Chiudi il menu mobile dopo il click su un link
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('aperto');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Barra di avanzamento + back-to-top ---------- */
  let ticking = false;
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';

    if (h.scrollTop > 600) {
      toTop.style.opacity = '1';
      toTop.style.pointerEvents = 'auto';
    } else {
      toTop.style.opacity = '0';
      toTop.style.pointerEvents = 'none';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scroll-spy: evidenzia capitolo attivo ---------- */
  const sezioni = links
    .map(function (a) {
      const id = a.getAttribute('href').slice(1);
      return { link: a, el: document.getElementById(id) };
    })
    .filter(function (s) { return s.el; });

  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle('attivo', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sezioni.forEach(function (s) { spy.observe(s.el); });

  /* ---------- Reveal on-scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visibile');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visibile'); });
  }

  /* ---------- Nav: sfondo solido dopo lo scroll ---------- */
  window.addEventListener('scroll', function () {
    nav.style.background = window.scrollY > 40
      ? 'rgba(255,255,255,0.94)'
      : 'rgba(255,255,255,0.86)';
  }, { passive: true });

  onScroll();
})();
