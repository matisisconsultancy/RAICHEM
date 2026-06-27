/* =====================================================================
   RAICHEM · BRAND BOOK — motore di interazione
   Preloader · cursore · hero canvas · reveal · counters · parallax
   horizontal pin · nav · progress
   ===================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  /* =============================================================
     1. PRELOADER
     ============================================================= */
  function preloader() {
    var loader = $('#loader'), bar = $('#loaderBar'), pct = $('#loaderPct');
    if (!loader) { revealHero(); return; }
    if (reduce) { loader.style.display = 'none'; revealHero(); return; }
    var p = 0;
    var iv = setInterval(function () {
      p += Math.random() * 16 + 6;
      if (p >= 100) { p = 100; clearInterval(iv); finish(); }
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = (p < 100 ? '0' : '') + Math.floor(p);
    }, 110);
    function finish() {
      setTimeout(function () {
        loader.classList.add('is-done');
        revealHero();
        setTimeout(function () { loader.style.display = 'none'; }, 1000);
      }, 250);
    }
  }

  /* =============================================================
     2. HERO — reveal lettere
     ============================================================= */
  function revealHero() {
    var ltrs = $$('#heroBrand .ltr');
    ltrs.forEach(function (l, i) {
      l.style.transition = 'transform 1s cubic-bezier(0.16,1,0.3,1)';
      l.style.transitionDelay = (0.05 * i) + 's';
      requestAnimationFrame(function () { l.style.transform = 'translateY(0)'; });
    });
  }

  /* =============================================================
     3. CURSORE CUSTOM
     ============================================================= */
  function cursore() {
    if (!fine || reduce) return;
    var ring = $('#cursor'), dot = $('#cursorDot'), label = $('#cursorLabel');
    if (!ring || !dot) return;
    document.documentElement.classList.add('has-cursor');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    (function loop() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', function () { ring.classList.add('is-hidden'); dot.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { ring.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); });

    var sel = 'a, button, [data-cursor], .card, .scopo-cell, .indice-item, .swatch, .pilastro, .ph, .nega li';
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest(sel); if (!t) return;
      var mode = t.getAttribute('data-cursor');
      ring.classList.add('is-hover');
      if (mode === 'drag') { ring.classList.add('is-label'); if (label) label.textContent = 'DRAG'; }
    });
    document.addEventListener('mouseout', function (e) {
      var t = e.target.closest(sel); if (!t) return;
      ring.classList.remove('is-hover', 'is-label');
      if (label) label.textContent = '';
    });
  }

  /* =============================================================
     4. HERO CANVAS — rete di nodi (sistema controllato)
     ============================================================= */
  function heroCanvas() {
    var cv = $('#heroCanvas'); if (!cv || reduce) return;
    var ctx = cv.getContext('2d'), w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], N, mouse = { x: -9999, y: -9999 };
    function size() {
      w = cv.offsetWidth; h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = Math.round(clamp((w * h) / 26000, 28, 80));
      nodes = [];
      for (var i = 0; i < N; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32 });
    }
    size();
    var ro = window.addEventListener ? window.addEventListener('resize', debounce(size, 200)) : null;
    var hero = $('#hero');
    hero.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
    var running = true;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < N; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        var dmx = n.x - mouse.x, dmy = n.y - mouse.y, dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 140) { n.x += (dmx / dm) * 0.6; n.y += (dmy / dm) * 0.6; }
        for (var j = i + 1; j < N; j++) {
          var m = nodes[j], dx = n.x - m.x, dy = n.y - m.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            var a = (1 - d / 130) * 0.5;
            ctx.strokeStyle = 'rgba(225,21,24,' + (a * 0.55) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
    // Pausa il canvas quando l'hero esce dallo schermo (performance)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        running = en[0].isIntersecting;
        if (running) frame();
      }, { threshold: 0 }).observe(hero);
    }

    // Glow che segue il mouse
    var glow = $('#heroGlow');
    if (glow) hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var gx = ((e.clientX - r.left) / r.width - 0.5) * 60;
      var gy = ((e.clientY - r.top) / r.height - 0.5) * 60;
      glow.style.transform = 'translate(calc(-50% + ' + gx + 'px), calc(-50% + ' + gy + 'px))';
    });
  }

  /* =============================================================
     5. REVEAL ON SCROLL (+ stagger)
     ============================================================= */
  function reveals() {
    var els = $$('[data-reveal], [data-reveal-stagger]');
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('in');
        if (el.hasAttribute('data-reveal-stagger')) {
          $$(':scope > *', el).forEach(function (child, i) {
            child.style.transitionDelay = (i * 0.07) + 's';
          });
        }
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* =============================================================
     6. COUNTERS
     ============================================================= */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.textContent = e.getAttribute('data-count'); }); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1500;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = clamp((ts - t0) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* =============================================================
     7. PARALLAX (ghost numbers) + scroll progress + nav
     ============================================================= */
  function scrollFx() {
    var parallax = $$('[data-parallax]');
    var progress = $('#progress');
    var nav = $('#nav');
    var hero = $('#hero');
    var toTop = $('#toTop');
    var lastY = window.scrollY, navHidden = false;
    var heroH = hero ? hero.offsetHeight : 600;

    function onScroll() {
      var y = window.scrollY;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

      // Nav: trasparente su hero, solida dopo
      if (nav) {
        if (y > heroH - 120) { nav.classList.add('solid'); nav.classList.remove('su-scuro'); }
        else { nav.classList.remove('solid'); nav.classList.add('su-scuro'); }
        // Hide on scroll down / show on scroll up
        if (y > heroH) {
          if (y > lastY + 6 && !navHidden) { nav.classList.add('nascosta'); navHidden = true; }
          else if (y < lastY - 6 && navHidden) { nav.classList.remove('nascosta'); navHidden = false; }
        } else if (navHidden) { nav.classList.remove('nascosta'); navHidden = false; }
      }

      if (!reduce) parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var off = (r.top + r.height / 2 - window.innerHeight / 2) * parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = 'translateY(' + (-off) + 'px)';
      });

      if (toTop) toTop.classList.toggle('visibile', y > window.innerHeight);
      lastY = y;
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', debounce(function () { heroH = hero ? hero.offsetHeight : 600; onScroll(); }, 200));
    onScroll();

    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  }

  /* =============================================================
     8. HORIZONTAL PIN — sezione claims
     ============================================================= */
  function horizontalPin() {
    var sec = $('#claims'), track = $('#hpinTrack'), prog = $('#hpinProg');
    if (!sec || !track) return;
    var canPin = fine && !reduce && window.innerWidth > 900;
    if (!canPin) { sec.classList.add('no-pin'); return; }

    var distance = 0, secTop = 0, secH = 0;
    function measure() {
      var vw = window.innerWidth;
      distance = Math.max(0, track.scrollWidth - vw + parseFloat(getComputedStyle(track).paddingLeft) );
      secH = window.innerHeight + distance;
      sec.style.height = secH + 'px';
      secTop = sec.getBoundingClientRect().top + window.scrollY;
    }
    measure();
    window.addEventListener('resize', debounce(measure, 200));
    window.addEventListener('load', measure);

    function onScroll() {
      var y = window.scrollY;
      var p = clamp((y - secTop) / (secH - window.innerHeight), 0, 1);
      track.style.transform = 'translateX(' + (-p * distance) + 'px)';
      if (prog) prog.style.width = (p * 100) + '%';
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* =============================================================
     9. NAV — menu mobile · scroll-spy · chiusura
     ============================================================= */
  function navigation() {
    var nav = $('#nav'), toggle = $('#navToggle'), navLinks = $('#navLinks');
    if (!nav || !toggle || !navLinks) return;
    var links = $$('a', navLinks);

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('aperto');
      toggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('aperto'); toggle.setAttribute('aria-expanded', 'false'); }
    });

    var sezioni = links.map(function (a) {
      var id = a.getAttribute('href').slice(1);
      return { link: a, el: document.getElementById(id) };
    }).filter(function (s) { return s.el; });
    if (!('IntersectionObserver' in window)) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (a) { a.classList.toggle('attivo', a.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sezioni.forEach(function (s) { spy.observe(s.el); });
  }

  /* =============================================================
     10. SMOOTH SCROLL CON MOMENTUM (preserva sticky/pin)
     ============================================================= */
  function smoothScroll() {
    if (!fine || reduce) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.documentElement.style.scrollBehavior = 'auto';
    var current = window.scrollY, target = current, animating = false;
    function maxY() { return document.documentElement.scrollHeight - window.innerHeight; }
    function loop() {
      current = lerp(current, target, 0.12);
      if (Math.abs(target - current) < 0.4) { current = target; window.scrollTo(0, current); animating = false; return; }
      window.scrollTo(0, current);
      requestAnimationFrame(loop);
    }
    function kick() { if (!animating) { animating = true; requestAnimationFrame(loop); } }
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;                 // pinch-zoom
      if (e.target.closest('.tab-wrap, .hpin.no-pin .hpin__track')) return; // scroll interno
      e.preventDefault();
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 26 : 1), 0, maxY());
      kick();
    }, { passive: false });
    // Sync quando si usa barra di scorrimento / tastiera
    window.addEventListener('scroll', function () { if (!animating) { current = target = window.scrollY; } }, { passive: true });
    // Anchor link fluidi
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href'); if (href.length < 2) return;
        var el = document.getElementById(href.slice(1)); if (!el) return;
        e.preventDefault();
        target = clamp(el.getBoundingClientRect().top + window.scrollY, 0, maxY());
        kick();
      });
    });
  }

  /* =============================================================
     11. SEDI — mappa interattiva (parallax + glow progressivo)
     ============================================================= */
  function sediMap() {
    var sec = $('#sedi'); if (!sec) return;
    var pins = $$('.pin', sec);
    var arcs = $$('.arc', sec);
    var grid = $('#sediGrid');
    var countEl = $('#sediCount');
    var nowEl = $('#sediNow');
    var wrap = $('.worldwrap', sec);
    if (!pins.length) return;
    var total = pins.length;
    var names = ['Milano — HQ', 'Barcelona', 'Hamburg', 'São Paulo', 'Shanghai'];
    var prev = -1;

    function apply(active) {
      pins.forEach(function (p, i) { p.classList.toggle('on', i < active); });
      arcs.forEach(function (a) { a.classList.toggle('on', parseInt(a.getAttribute('data-arc'), 10) < active); });
      if (countEl) countEl.textContent = active;
      if (nowEl && active > 0 && active !== prev) {
        nowEl.textContent = '› ATTIVAZIONE SEDE ' + (active < 10 ? '0' : '') + active + ' · ' + (names[active - 1] || '');
      }
      prev = active;
    }

    if (reduce || !fine) { apply(total); if (nowEl) nowEl.textContent = '› 5 SEDI · 3 CONTINENTI'; return; }

    var secTop = 0, secH = 0;
    function measure() { var r = sec.getBoundingClientRect(); secTop = r.top + window.scrollY; secH = sec.offsetHeight; }
    measure();
    window.addEventListener('resize', debounce(measure, 200));
    window.addEventListener('load', measure);

    function onScroll() {
      var p = clamp((window.scrollY - secTop) / (secH - window.innerHeight), 0, 1);
      var active = clamp(Math.floor(p * (total + 0.6)) + 1, 1, total);
      if (p <= 0.001) active = window.scrollY >= secTop ? 1 : 0;
      apply(active);
      if (grid) grid.style.transform = 'translateY(' + ((p - 0.5) * -50) + 'px)';
      if (wrap) wrap.style.transform = 'scale(' + (0.94 + p * 0.06) + ')';
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* =============================================================
     UTIL
     ============================================================= */
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* =============================================================
     INIT
     ============================================================= */
  function init() {
    preloader();
    cursore();
    heroCanvas();
    reveals();
    counters();
    scrollFx();
    horizontalPin();
    navigation();
    smoothScroll();
    sediMap();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
