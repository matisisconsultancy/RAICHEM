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
    var ll = $('#loaderLogo'); if (ll) requestAnimationFrame(function () { ll.classList.add('go'); });
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
    var hero = $('#hero'); if (!hero) return;
    // una sola entrata elegante: il blocco hero sale e appare in dissolvenza
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('in'); }); });
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
    var cv = $('#heroCanvas'); if (!cv) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var hero = $('#hero'), glow = $('#heroGlow');

    // Attrattore di Lorenz — la variabile instabile resa sistema controllato.
    var pts = [], x = 0.1, y = 0, z = 0, s = 10, r = 28, be = 8 / 3, dt = 0.005, N = 11000, i;
    for (i = 0; i < N; i++) {
      var dx = s * (y - x), dy = x * (r - z) - y, dz = x * y - be * z;
      x += dx * dt; y += dy * dt; z += dz * dt;
      pts.push([x, y, z - 25]);
    }

    var w, h, scale, cx, cy;
    function size() {
      w = cv.offsetWidth; h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(w / 38, h / 46); cx = w * 0.5; cy = h * 0.47;
    }
    size();
    window.addEventListener('resize', debounce(size, 200));
    window.addEventListener('load', size);

    var mouseX = 0.5;
    hero.addEventListener('mousemove', function (e) {
      var rb = hero.getBoundingClientRect(); mouseX = (e.clientX - rb.left) / rb.width;
      if (glow) {
        var gx = (mouseX - 0.5) * 60, gy = ((e.clientY - rb.top) / rb.height - 0.5) * 60;
        glow.style.transform = 'translate(calc(-50% + ' + gx + 'px), calc(-50% + ' + gy + 'px))';
      }
    });

    function render(a) {
      var cosA = Math.cos(a), sinA = Math.sin(a), p, rx, depth, sx, sy, near;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < N; i++) {
        p = pts[i];
        rx = p[0] * cosA - p[1] * sinA;
        depth = p[0] * sinA + p[1] * cosA;
        sx = cx + rx * scale; sy = cy - p[2] * scale;
        near = clamp((depth + 25) / 50, 0, 1);
        ctx.fillStyle = 'rgba(' + Math.round(205 + near * 45) + ',' + Math.round(28 + near * 40) + ',26,' + (0.08 + near * 0.16) + ')';
        ctx.fillRect(sx, sy, 1.6, 1.6);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    if (reduce) { render(0.25); return; }

    var t = 0, head = 0, running = true;
    function frame() {
      if (!running) return;
      t += 0.005;
      var a = Math.sin(t) * 0.5 + (mouseX - 0.5) * 0.6;   // balanceo dolce, mostly face-on
      render(a);
      // particella in transito (testa) — punto arancio luminoso che osserva il sistema
      head = (head + 5) % N;
      var cosA = Math.cos(a), sinA = Math.sin(a), hp = pts[head];
      var hx = cx + (hp[0] * cosA - hp[1] * sinA) * scale, hy = cy - hp[2] * scale;
      ctx.shadowColor = 'rgba(255,95,35,0.9)'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#ff6a2a';
      ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      requestAnimationFrame(frame);
    }
    frame();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; frame(); }
        else running = vis;
      }, { threshold: 0 }).observe(hero);
    }
  }

  /* =============================================================
     4b. OROLOGIO HERO — readout strumentale live
     ============================================================= */
  function clock() {
    var nav = $('#navClock'), hero = $('#heroClock');
    if (!nav && !hero) return;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var d = new Date(), s = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      if (nav) nav.textContent = s;
      if (hero) hero.textContent = 'LOCAL ' + s;
      setTimeout(tick, 1000);
    }
    tick();
  }

  /* =============================================================
     4c. CAMPO PERSISTENTE — attrattore del caos che si controlla
         (chaos → reticolo blueprint) sincronizzato allo scroll
     ============================================================= */
  function field() {
    // Sfondo minimale e STATICO: reticolo blueprint quieto, nessuna animazione.
    // Niente attrattore caotico, niente cerchio che si muove veloce.
    var cv = document.getElementById('field');
    var hudBar = document.getElementById('hudBar'), hudPct = document.getElementById('hudPct'), hudSt = document.getElementById('hudState');

    function updateHud(p) {
      if (hudBar) hudBar.style.width = (p * 100) + '%';
      if (hudPct) hudPct.textContent = Math.round(p * 100) + '%';
      if (hudSt) hudSt.textContent = p < 0.12 ? 'OSSERVAZIONE' : p < 0.45 ? 'STABILIZZAZIONE' : p < 0.82 ? 'CONTROLLO' : 'SISTEMA CONTROLLATO';
    }
    function onScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      updateHud(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!cv) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), w, h;
    function draw() {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // punti di reticolo discreti, immobili — texture tecnica appena percettibile
      var gap = 46, r = 1.1;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (var gx = gap; gx < w; gx += gap) {
        for (var gy = gap; gy < h; gy += gap) {
          ctx.beginPath(); ctx.arc(gx, gy, r, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    draw();
    window.addEventListener('resize', debounce(draw, 200));
  }

  /* =============================================================
     5. REVEAL ON SCROLL (+ stagger)
     ============================================================= */
  function reveals() {
    var els = $$('[data-reveal], [data-reveal-stagger], [data-enter]');
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
    var secs = $$('.hpin');
    if (!secs.length) return;
    var canPin = fine && !reduce && window.innerWidth > 900;
    secs.forEach(function (sec) {
      var track = $('.hpin__track', sec), prog = $('.hpin__prog i', sec);
      if (!track) return;
      if (!canPin) { sec.classList.add('no-pin'); return; }
      var distance = 0, secTop = 0, secH = 0;
      function measure() {
        var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        distance = Math.max(0, track.scrollWidth - window.innerWidth + pad);
        secH = window.innerHeight + distance;
        sec.style.height = secH + 'px';
        secTop = sec.getBoundingClientRect().top + window.scrollY;
      }
      measure();
      window.addEventListener('resize', debounce(measure, 200));
      window.addEventListener('load', measure);
      function onScroll() {
        var p = clamp((window.scrollY - secTop) / (secH - window.innerHeight), 0, 1);
        track.style.transform = 'translateX(' + (-p * distance) + 'px)';
        if (prog) prog.style.width = (p * 100) + '%';
      }
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
      }, { passive: true });
      onScroll();
    });
  }

  /* =============================================================
     8b. PLATE GENERATIVE — attrattori di Clifford (b/n) nelle card
     ============================================================= */
  function genPlates() {
    var canvases = $$('.obs-card__plate canvas');
    if (!canvases.length) return;
    var presets = [
      [-1.4, 1.6, 1.0, 0.7], [1.7, 1.7, 0.6, 1.2], [-1.7, 1.3, -0.1, -1.2],
      [-1.8, -2.0, -0.5, -0.9], [1.5, -1.8, 1.6, 0.9], [1.6, -0.6, -1.2, 1.6],
      [-2.0, -2.0, -1.2, 2.0]
    ];
    function draw(cv, P) {
      var w = cv.offsetWidth, h = cv.offsetHeight;
      if (!w || !h) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr; cv.height = h * dpr;
      var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#f4f4f2'; ctx.fillRect(0, 0, w, h);
      var a = P[0], b = P[1], c = P[2], d = P[3], x = 0.1, y = 0.1, i, nx, ny;
      var rng = 2 + Math.max(Math.abs(c), Math.abs(d));
      var sx = (w * 0.46) / rng, sy = (h * 0.46) / rng, cx = w / 2, cy = h / 2;
      ctx.fillStyle = 'rgba(11,11,12,0.16)';
      var N = 48000;
      for (i = 0; i < N; i++) {
        nx = Math.sin(a * y) + c * Math.cos(a * x);
        ny = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx; y = ny;
        if (i > 20) ctx.fillRect(cx + x * sx, cy + y * sy, 0.8, 0.8);
      }
    }
    function all() {
      canvases.forEach(function (cv, idx) {
        var v = parseInt(cv.getAttribute('data-variant') || idx, 10) % presets.length;
        draw(cv, presets[v]);
      });
    }
    all();
    window.addEventListener('resize', debounce(all, 250));
  }

  /* =============================================================
     9. NAV — menu mobile · scroll-spy · chiusura
     ============================================================= */
  function navigation() {
    var nav = $('#nav'), toggle = $('#navToggle'), navLinks = $('#navLinks'), menu = $('#navMenu');
    if (!nav || !toggle || !navLinks) return;
    var links = $$('a', navLinks);

    function setOpen(open) {
      nav.classList.toggle('aperto', open);
      if (menu) { menu.classList.toggle('open', open); menu.setAttribute('aria-hidden', String(!open)); }
      toggle.setAttribute('aria-expanded', String(open));
      var lab = $('.nav__menu-lab', toggle);
      if (lab) lab.textContent = open ? (lab.getAttribute('data-close') || 'Chiudi') : (lab.getAttribute('data-open') || 'Indice');
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('aperto')); });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aperto')) setOpen(false); });

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
     12. MOLECOLE — animazione chimica nei pannelli claim
     ============================================================= */
  function molecules() {
    var canvases = $$('.mol');
    if (!canvases.length) return;
    // hexagon aromatico (benzene)
    var HEX = [[0, 0.5], [-0.433, 0.25], [-0.433, -0.25], [0, -0.5], [0.433, -0.25], [0.433, 0.25]];
    var HEXB = [[0,1,1],[1,2,2],[2,3,1],[3,4,2],[4,5,1],[5,0,2]];
    var T = [
      // 0 · benzene
      { atoms: HEX, bonds: HEXB, accent: 0 },
      // 1 · benzoyl (anello + C=O)
      { atoms: HEX.concat([[0.9, 0.5], [1.25, 0.95]]), bonds: HEXB.concat([[5, 6, 1], [6, 7, 2]]), accent: 7 },
      // 2 · perossido O-O con rami (cuore del BPO)
      { atoms: [[-0.25, 0], [0.25, 0], [-0.8, 0.45], [-0.8, -0.45], [0.8, 0.45], [0.8, -0.45]],
        bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 2], [1, 4, 1], [1, 5, 2]], accent: 0 },
      // 3 · catena zig-zag
      { atoms: [[-1, 0.25], [-0.5, -0.25], [0, 0.25], [0.5, -0.25], [1, 0.25]],
        bonds: [[0, 1, 1], [1, 2, 2], [2, 3, 1], [3, 4, 2]], accent: 2 },
      // 4 · ramificata
      { atoms: [[0, 0], [0.85, 0.45], [0.85, -0.45], [-0.85, 0.45], [-0.85, -0.45]],
        bonds: [[0, 1, 1], [0, 2, 2], [0, 3, 2], [0, 4, 1]], accent: 0 },
      // 5 · biciclica (naftalene)
      { atoms: [[-0.9, 0.25], [-0.9, -0.25], [-0.45, 0.5], [-0.45, -0.5], [0, 0.25], [0, -0.25], [0.45, 0.5], [0.45, -0.5], [0.9, 0.25], [0.9, -0.25]],
        bonds: [[0, 2, 1], [2, 4, 2], [4, 5, 1], [5, 3, 2], [3, 1, 1], [1, 0, 2], [4, 6, 1], [6, 8, 2], [8, 9, 1], [9, 7, 2], [7, 5, 1]], accent: 4 },
      // 6 · anello triangolare con sostituenti
      { atoms: [[0, -0.5], [0.45, 0.3], [-0.45, 0.3], [0, -1.05], [0.95, 0.6], [-0.95, 0.6]],
        bonds: [[0, 1, 1], [1, 2, 1], [2, 0, 1], [0, 3, 2], [1, 4, 1], [2, 5, 1]], accent: 0 }
    ];

    canvases.forEach(function (cv) {
      var tpl = T[(parseInt(cv.getAttribute('data-mol'), 10) || 0) % T.length];
      var onRed = !!cv.closest('.master');
      var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w, h, running = true, t = (parseInt(cv.getAttribute('data-mol'), 10) || 0) * 1.7;
      function size() { w = cv.offsetWidth; h = cv.offsetHeight; if (!w || !h) return; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      size();
      window.addEventListener('resize', debounce(size, 250));
      var atomCol = onRed ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.92)';
      var bondCol = onRed ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.22)';
      var accCol = onRed ? '#0b0b0c' : '#E11518';
      function frame() {
        if (!running || !w) return;
        t += 0.01;
        var R = Math.min(w, h) * 0.3, cx = w * 0.5, cy = h * 0.5, rot = t * 0.18, c = Math.cos(rot), s = Math.sin(rot);
        var pos = tpl.atoms.map(function (a, i) {
          var vib = 1 + Math.sin(t * 1.6 + i) * 0.035;
          var ax = a[0] * vib, ay = a[1] * vib;
          return [cx + (ax * c - ay * s) * R, cy + (ax * s + ay * c) * R];
        });
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 1.3; ctx.strokeStyle = bondCol;
        tpl.bonds.forEach(function (b) {
          var p = pos[b[0]], q = pos[b[1]];
          if (b[2] === 2) {
            var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, ox = -dy / l * 2.6, oy = dx / l * 2.6;
            seg(p[0] + ox, p[1] + oy, q[0] + ox, q[1] + oy); seg(p[0] - ox, p[1] - oy, q[0] - ox, q[1] - oy);
          } else seg(p[0], p[1], q[0], q[1]);
        });
        pos.forEach(function (p, i) {
          var acc = i === tpl.accent;
          ctx.fillStyle = acc ? accCol : atomCol;
          if (acc && !onRed) { ctx.shadowColor = 'rgba(225,21,24,0.85)'; ctx.shadowBlur = 12; }
          ctx.beginPath(); ctx.arc(p[0], p[1], acc ? 4.2 : 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        });
        requestAnimationFrame(frame);
      }
      function seg(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      if (reduce) { frame(); return; }
      frame();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
          var v = e[0].isIntersecting;
          if (v && !running) { running = true; frame(); } else running = v;
        }, { threshold: 0 }).observe(cv);
      }
    });
  }

  /* =============================================================
     13. LOGO — disegna lo swoosh quando entra in vista
     ============================================================= */
  function logoReveal() {
    var logos = $$('.logo--anim');
    logos.forEach(function (l) { if (l.id === 'loaderLogo') return; });
    var targets = logos.filter(function (l) { return l.id !== 'loaderLogo'; });
    if (!targets.length) return;
    if (reduce || !('IntersectionObserver' in window)) { targets.forEach(function (l) { l.classList.add('go'); }); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('go'); obs.unobserve(en.target); } });
    }, { threshold: 0.4 });
    targets.forEach(function (l) { io.observe(l); });
  }

  /* =============================================================
     ATELIER — vetrina mockup: filtri + lightbox
     ============================================================= */
  function atelier() {
    var grid = document.getElementById('atelier');
    if (!grid) return;
    var cards = $$('.acard', grid);
    var chips = $$('.fchip');
    var current = 'all';

    function decode(s) { var t = document.createElement('textarea'); t.innerHTML = s; return t.value; }

    /* ---- filtri ---- */
    function applyFilter(f) {
      current = f;
      chips.forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-filter') === f); });
      cards.forEach(function (card) {
        var match = (f === 'all' || card.getAttribute('data-cat') === f);
        card.classList.add('is-filtering');
        if (match) {
          card.hidden = false;
          requestAnimationFrame(function () { card.classList.remove('is-off'); });
        } else {
          card.classList.add('is-off');
          var done = function () { if (card.classList.contains('is-off')) card.hidden = true; card.removeEventListener('transitionend', done); };
          if (reduce) { card.hidden = true; } else { card.addEventListener('transitionend', done); }
        }
      });
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { applyFilter(c.getAttribute('data-filter')); }); });

    /* ---- lightbox ---- */
    var lb = document.getElementById('lbox');
    var lbImg = document.getElementById('lboxImg');
    var lbCat = document.getElementById('lboxCat');
    var lbTitle = document.getElementById('lboxTitle');
    var lbIdx = document.getElementById('lboxIdx');
    var lbTot = document.getElementById('lboxTot');
    var pos = 0, list = [];

    function visibleList() { return cards.filter(function (c) { return !c.hidden; }); }
    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function show(i) {
      if (!list.length) return;
      pos = (i + list.length) % list.length;
      var card = list[pos];
      lbImg.classList.remove('show');
      lbImg.src = card.getAttribute('data-src');
      lbImg.alt = decode(card.getAttribute('data-title') || '');
      lbCat.textContent = decode(card.getAttribute('data-clabel') || '');
      lbTitle.innerHTML = card.getAttribute('data-title') || '';
      lbIdx.textContent = pad(pos + 1);
      lbTot.textContent = pad(list.length);
    }
    function open(card) {
      list = visibleList();
      var i = list.indexOf(card); if (i < 0) i = 0;
      show(i);
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
    }
    cards.forEach(function (card) { card.addEventListener('click', function () { open(card); }); });
    document.getElementById('lboxClose').addEventListener('click', close);
    document.getElementById('lboxPrev').addEventListener('click', function () { show(pos - 1); });
    document.getElementById('lboxNext').addEventListener('click', function () { show(pos + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lbox__stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(pos - 1);
      else if (e.key === 'ArrowRight') show(pos + 1);
    });
  }

  /* =============================================================
     VOCE — personalità in scroll: parola + significato + immagine
     (un pannello resta fisso, il contenuto cambia con lo scroll)
     ============================================================= */
  function voceScroll() {
    var sec = document.getElementById('voce-scroll'); if (!sec) return;
    var steps = $$('.vs__step', sec);
    var imgs = $$('.vs__img', sec);
    var elNum = $('.vs__num', sec), elWord = $('.vs__word', sec), elNo = $('.vs__no', sec), elMean = $('.vs__mean', sec);
    if (!steps.length) return;
    var active = -1;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function setActive(i) {
      if (i === active) return; active = i;
      var s = steps[i];
      steps.forEach(function (st, k) { st.classList.toggle('is-active', k === i); });
      imgs.forEach(function (im) { im.classList.toggle('is-on', +im.getAttribute('data-i') === i); });
      if (elNum) elNum.textContent = pad(i + 1);
      if (elWord) elWord.textContent = s.getAttribute('data-word') || '';
      if (elNo) elNo.textContent = s.getAttribute('data-non') || '';
      if (elMean) elMean.textContent = s.getAttribute('data-mean') || '';
      // retrigger micro-animazione caption
      if (elWord) { elWord.classList.remove('swap'); void elWord.offsetWidth; elWord.classList.add('swap'); }
    }
    if (!('IntersectionObserver' in window)) { setActive(0); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(steps.indexOf(en.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach(function (s) { io.observe(s); });
    setActive(0);
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
    field();
    clock();
    reveals();
    counters();
    scrollFx();
    horizontalPin();
    genPlates();
    molecules();
    logoReveal();
    navigation();
    smoothScroll();
    atelier();
    voceScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
