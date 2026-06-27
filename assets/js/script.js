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
    var el = $('#heroClock'); if (!el) return;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var d = new Date();
      el.textContent = 'LOCAL ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      setTimeout(tick, 1000);
    }
    tick();
  }

  /* =============================================================
     4c. CAMPO PERSISTENTE — attrattore del caos che si controlla
         (chaos → reticolo blueprint) sincronizzato allo scroll
     ============================================================= */
  function field() {
    var cv = document.getElementById('field'); if (!cv) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var N = window.innerWidth < 760 ? 2800 : 6000, pts = [], lat = [], x = 0.1, y = 0, z = 0, i;
    for (i = 0; i < N; i++) {
      var dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - (8 / 3) * z;
      x += dx * 0.006; y += dy * 0.006; z += dz * 0.006;
      pts.push([x, y, z - 25]);
    }
    // reticolo blueprint di destinazione: l'ordine = il controllo
    var cols = 100, rows = Math.ceil(N / cols);
    for (i = 0; i < N; i++) {
      lat.push([((i % cols) / (cols - 1) - 0.5) * 46, 0, (Math.floor(i / cols) / (rows - 1) - 0.5) * 52]);
    }
    var w, h, scale, cx, cy;
    function size() {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(w / 44, h / 52); cx = w * 0.5; cy = h * 0.5;
    }
    size();
    window.addEventListener('resize', debounce(size, 200));

    var hudBar = document.getElementById('hudBar'), hudPct = document.getElementById('hudPct'), hudSt = document.getElementById('hudState');
    var control = 0, target = 0, t = 0, head = 0, running = true;
    function updateHud(p) {
      if (hudBar) hudBar.style.width = (p * 100) + '%';
      if (hudPct) hudPct.textContent = Math.round(p * 100) + '%';
      if (hudSt) hudSt.textContent = p < 0.12 ? 'OSSERVAZIONE' : p < 0.45 ? 'STABILIZZAZIONE' : p < 0.82 ? 'CONTROLLO' : 'SISTEMA CONTROLLATO';
    }
    function onScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      updateHud(target);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function render(e, a) {
      var cosA = Math.cos(a), sinA = Math.sin(a), p, l, px, py, pz, rx, depth, sx, sy, near;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < N; i++) {
        p = pts[i]; l = lat[i];
        px = p[0] + (l[0] - p[0]) * e; py = p[1] + (l[1] - p[1]) * e; pz = p[2] + (l[2] - p[2]) * e;
        rx = px * cosA - py * sinA; depth = px * sinA + py * cosA;
        sx = cx + rx * scale; sy = cy - pz * scale;
        near = clamp((depth + 25) / 50, 0, 1);
        ctx.fillStyle = 'rgba(' + Math.round(205 + near * 45) + ',' + Math.round(26 + near * 40) + ',26,' + (0.05 + near * 0.12) + ')';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    if (reduce) { render(0.4, 0.3); return; }

    function frame() {
      if (!running) return;
      control += (target - control) * 0.05;
      t += 0.004;
      var a = Math.sin(t) * 0.5 * (1 - control * 0.75);
      render(control, a);
      head = (head + 5) % N;
      if (control < 0.9) {
        var cosA = Math.cos(a), sinA = Math.sin(a), hp = pts[head], lt = lat[head];
        var hpx = hp[0] + (lt[0] - hp[0]) * control, hpy = hp[1] + (lt[1] - hp[1]) * control, hpz = hp[2] + (lt[2] - hp[2]) * control;
        var hx = cx + (hpx * cosA - hpy * sinA) * scale, hy = cy - hpz * scale;
        ctx.shadowColor = 'rgba(255,95,35,' + (0.9 * (1 - control)) + ')'; ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(255,106,42,' + (1 - control * 0.7) + ')';
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
      requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) frame(); });
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
    field();
    clock();
    reveals();
    counters();
    scrollFx();
    horizontalPin();
    genPlates();
    navigation();
    smoothScroll();
    sediMap();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
