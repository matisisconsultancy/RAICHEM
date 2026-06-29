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
     4b. HERO CINEMATICO — campo + molecola astratta del BPO
     Campo di particelle + rete molecolare, reazione al cursore, parallax,
     e la molecola del perossido di benzoile (BPO) che si assembla da punti.
     Pausa fuori vista / a tab nascosta; rispetta reduced-motion.
     ============================================================= */
  function heroCinema() {
    var hero = $('#hero'); if (!hero) return;
    var cv = $('#heroFx'), inner = $('#heroInner'), glow = $('.hero__aura', hero);
    var ctx = (cv && cv.getContext) ? cv.getContext('2d') : null;
    if (!ctx) return;
    var cheap = !fine; // touch / coarse pointer: rendering piu leggero = scorrevole
    var dpr = Math.min(window.devicePixelRatio || 1, cheap ? 1.5 : 2);
    var w = 0, h = 0, cx = 0, cy = 0;
    var RED = '201,21,23';
    function rnd(a, b) { return a + Math.random() * (b - a); }

    function size() {
      var r = hero.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height); cx = w / 2; cy = h / 2;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    var COUNT = Math.round(clamp((w * h) / 12000, 36, 120));
    var ps = [];
    for (var i = 0; i < COUNT; i++) {
      var depth = rnd(0.32, 1);
      ps.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.15, 0.15), vy: rnd(-0.1, 0.1),
                r: rnd(0.5, 1.7) * depth + 0.4, depth: depth, tw: rnd(0, 6.28) });
    }

    // puntatore (relativo all'hero)
    var mx = cx, my = cy, tmx = cx, tmy = cy, inside = false;
    if (fine) window.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      inside = window.scrollY < h * 0.85 && mx >= 0 && my >= 0 && mx <= w && my <= h;
    }, { passive: true });
    window.addEventListener('blur', function () { inside = false; });

    // molecola astratta del BPO (perossido di benzoile): due anelli benzenici
    // uniti dal ponte perossido O–O. Formata da molti punti che si assemblano.
    var MOL = (function buildBPO() {
      var nodes = [], bonds = [], R = 0.16, i, a;
      function add(lx, ly, type) { nodes.push({ lx: lx, ly: ly, type: type, ph: Math.random() * 6.28, sa: Math.random() * 6.28, sd: 0.5 + Math.random() * 0.8, wx: 0, wy: 0 }); return nodes.length - 1; }
      var ringA = [], ringB = [];
      for (i = 0; i < 6; i++) { a = i * Math.PI / 3; ringA.push(add(-0.62 + R * Math.cos(a), R * Math.sin(a), 'C')); }
      for (i = 0; i < 6; i++) { a = i * Math.PI / 3; ringB.push(add(0.62 + R * Math.cos(a), R * Math.sin(a), 'C')); }
      var Ca = add(-0.34, 0, 'C'), Oa = add(-0.34, -0.20, 'O');
      var Cb = add(0.34, 0, 'C'), Ob = add(0.34, 0.20, 'O');
      var O1 = add(-0.12, 0.03, 'O'), O2 = add(0.12, -0.03, 'O');
      for (i = 0; i < 6; i++) { bonds.push([ringA[i], ringA[(i + 1) % 6], i % 2]); bonds.push([ringB[i], ringB[(i + 1) % 6], i % 2]); }
      bonds.push([ringA[0], Ca, 0], [Ca, Oa, 1], [Ca, O1, 0], [O1, O2, 0], [O2, Cb, 0], [Cb, Ob, 1], [ringB[3], Cb, 0]);
      return { nodes: nodes, bonds: bonds };
    })();

    function flow(x, y, tn) {
      return [Math.sin(y * 0.0042 + tn * 0.00026) * 0.018, Math.cos(x * 0.0042 - tn * 0.00022) * 0.012];
    }

    var t0 = 0, last = 0, raf = 0, running = false;

    function step(ts) {
      if (!t0) { t0 = ts; last = ts; }
      var dt = Math.min(50, ts - last); last = ts; var sc = dt / 16.7;
      var tn = ts - t0;
      var introE = 1 - Math.pow(1 - clamp(tn / 1700, 0, 1), 3);
      tmx = lerp(tmx, inside ? mx : cx, 0.05); tmy = lerp(tmy, inside ? my : cy, 0.05);
      var ox = tmx - cx, oy = tmy - cy;

      ctx.clearRect(0, 0, w, h);

      var i, p;
      for (i = 0; i < ps.length; i++) {
        p = ps[i];
        var f = flow(p.x, p.y, tn); p.vx += f[0]; p.vy += f[1];
        if (inside) {
          var dx = p.x - tmx, dy = p.y - tmy, d2 = dx * dx + dy * dy;
          if (d2 < 15000) { var d = Math.sqrt(d2) || 1, force = (1 - d / 122) * 0.5 * p.depth; p.vx += dx / d * force; p.vy += dy / d * force; }
        }
        p.vx *= 0.95; p.vy *= 0.95;
        p.vx = clamp(p.vx, -0.7, 0.7); p.vy = clamp(p.vy, -0.7, 0.7);
        p.x += p.vx * sc; p.y += p.vy * sc;
        if (p.x < -24) p.x = w + 24; else if (p.x > w + 24) p.x = -24;
        if (p.y < -24) p.y = h + 24; else if (p.y > h + 24) p.y = -24;
      }

      var LINK = 130, LINK2 = LINK * LINK;
      for (var a = 0; a < ps.length; a++) {
        var pa = ps[a], pax = pa.x + ox * 0.05 * pa.depth, pay = pa.y + oy * 0.05 * pa.depth;
        for (var b = a + 1; b < ps.length; b++) {
          var pb = ps[b], ex = pa.x - pb.x, ey = pa.y - pb.y, dd = ex * ex + ey * ey;
          if (dd < LINK2) {
            var dist = Math.sqrt(dd), al = 1 - dist / LINK, red = 0;
            if (inside) { var mxd = (pa.x + pb.x) * 0.5 - tmx, myd = (pa.y + pb.y) * 0.5 - tmy; red = clamp(1 - Math.sqrt(mxd * mxd + myd * myd) / 190, 0, 1); }
            ctx.beginPath(); ctx.moveTo(pax, pay); ctx.lineTo(pb.x + ox * 0.05 * pb.depth, pb.y + oy * 0.05 * pb.depth);
            if (red > 0.02) { ctx.strokeStyle = 'rgba(' + RED + ',' + (al * (0.12 + red * 0.55) * introE) + ')'; ctx.lineWidth = 0.6 + red * 0.7; }
            else { ctx.strokeStyle = 'rgba(255,255,255,' + (al * 0.14 * introE) + ')'; ctx.lineWidth = 0.6; }
            ctx.stroke();
          }
        }
      }

      for (i = 0; i < ps.length; i++) {
        p = ps[i];
        var px = p.x + ox * 0.05 * p.depth, py = p.y + oy * 0.05 * p.depth;
        var tw = 0.6 + 0.4 * Math.sin(tn * 0.002 + p.tw), aa = (0.22 + 0.34 * p.depth) * tw * introE, rd = 0;
        if (inside) { var qx = p.x - tmx, qy = p.y - tmy; rd = clamp(1 - Math.sqrt(qx * qx + qy * qy) / 150, 0, 1); }
        ctx.beginPath(); ctx.arc(px, py, p.r, 0, 6.2832);
        if (rd > 0.02) ctx.fillStyle = 'rgba(' + Math.round(255 - 54 * rd) + ',' + Math.round(255 - 234 * rd) + ',' + Math.round(255 - 232 * rd) + ',' + aa + ')';
        else ctx.fillStyle = 'rgba(255,255,255,' + aa + ')';
        ctx.fill();
      }

      // ----- molecola BPO: assemblaggio di punti in struttura -----
      var ms = Math.min(w * 0.5, h * 1.9) * (1 + 0.02 * Math.sin(tn * 0.0008));
      var rot = Math.sin(tn * 0.00009) * 0.06, cr = Math.cos(rot), sr = Math.sin(rot);
      var mn = MOL.nodes, n2, nd, lx, ly;
      for (n2 = 0; n2 < mn.length; n2++) {
        nd = mn[n2];
        lx = nd.lx * cr - nd.ly * sr; ly = nd.lx * sr + nd.ly * cr;
        var tx = cx + lx * ms + ox * 0.03, ty = cy + ly * ms + oy * 0.03;
        var sx = Math.cos(nd.sa) * nd.sd * ms * 0.6, sy = Math.sin(nd.sa) * nd.sd * ms * 0.6;
        nd.wx = tx + sx * (1 - introE) + Math.sin(tn * 0.001 + nd.ph) * 2.2 * introE;
        nd.wy = ty + sy * (1 - introE) + Math.cos(tn * 0.0011 + nd.ph) * 2.2 * introE;
      }
      var mb = MOL.bonds, bd, A2, B2;
      for (bd = 0; bd < mb.length; bd++) {
        A2 = mn[mb[bd][0]]; B2 = mn[mb[bd][1]];
        var oO = (A2.type === 'O' || B2.type === 'O');
        var bx = B2.wx - A2.wx, by = B2.wy - A2.wy, blen = Math.sqrt(bx * bx + by * by) || 1;
        var dots = Math.max(3, Math.round(blen / 9)), perx = -by / blen, pery = bx / blen;
        var rows = mb[bd][2] ? [-2.2, 2.2] : [0];
        for (var ri = 0; ri < rows.length; ri++) {
          for (var kk = 0; kk <= dots; kk++) {
            var tt = kk / dots, edge = Math.sin(tt * Math.PI);
            var al = (0.18 + 0.26 * edge) * introE;
            ctx.beginPath(); ctx.arc(A2.wx + bx * tt + perx * rows[ri], A2.wy + by * tt + pery * rows[ri], 1.05, 0, 6.2832);
            ctx.fillStyle = oO ? 'rgba(214,46,44,' + (al * 1.1) + ')' : 'rgba(220,226,235,' + al + ')';
            ctx.fill();
          }
        }
      }
      for (n2 = 0; n2 < mn.length; n2++) {
        nd = mn[n2];
        var isO = nd.type === 'O', pulse = 0.7 + 0.3 * Math.sin(tn * 0.002 + nd.ph), near = 0;
        if (inside) { var qd = Math.sqrt((nd.wx - tmx) * (nd.wx - tmx) + (nd.wy - tmy) * (nd.wy - tmy)); near = clamp(1 - qd / 140, 0, 1); }
        var aa2 = (isO ? 0.78 : 0.6) * pulse * introE + near * 0.4;
        ctx.save();
        if (!cheap) { ctx.shadowBlur = (isO ? 12 : 7) + near * 8; ctx.shadowColor = isO ? 'rgba(228,42,40,0.95)' : 'rgba(210,220,240,0.7)'; }
        ctx.beginPath(); ctx.arc(nd.wx, nd.wy, (isO ? 2.8 : 2.15) + near * 1.6, 0, 6.2832);
        ctx.fillStyle = isO ? 'rgba(255,120,110,' + aa2 + ')' : 'rgba(238,242,250,' + aa2 + ')';
        ctx.fill(); ctx.restore();
      }

      if (fine && inner) inner.style.transform = 'translate3d(' + (-ox * 0.02) + 'px,' + (-oy * 0.02) + 'px,0)';
      if (fine && glow) glow.style.transform = 'translate3d(' + (ox * 0.045) + 'px,' + (oy * 0.045) + 'px,0)';

      if (running) raf = requestAnimationFrame(step);
    }

    function start() { if (running) return; running = true; t0 = 0; raf = requestAnimationFrame(step); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    if (reduce) {
      for (var j = 0; j < ps.length; j++) { var q = ps[j]; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.4 * q.depth) + ')'; ctx.fill(); }
      return;
    }
    start();
    window.addEventListener('scroll', function () { if (window.scrollY > h) stop(); else start(); }, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (window.scrollY <= h) start(); });
    window.addEventListener('resize', debounce(function () {
      size();
      for (var k = 0; k < ps.length; k++) { if (ps[k].x > w) ps[k].x = rnd(0, w); if (ps[k].y > h) ps[k].y = rnd(0, h); }
    }, 200));
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
        // Navbar sempre fissa e visibile (niente hide-on-scroll)
        if (navHidden) { nav.classList.remove('nascosta'); navHidden = false; }
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
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter') === f;
        c.classList.toggle('is-active', on);
        // su mobile la barra scorre: porta il filtro attivo in vista
        if (on && c.scrollIntoView) c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      });
      // con filtro attivo: ogni immagine a tutto schermo, impilata; senza filtro: mosaico
      grid.classList.toggle('is-single', f !== 'all');
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
      if (typeof resetZoom === 'function') resetZoom();
      var card = list[pos];
      var src = card.getAttribute('data-src');
      // crossfade: precarica la nuova immagine, poi dissolvi
      lbImg.classList.add('swapping');
      var pre = new Image();
      pre.onload = function () { lbImg.src = src; requestAnimationFrame(function () { lbImg.classList.remove('swapping'); }); };
      pre.onerror = function () { lbImg.src = src; lbImg.classList.remove('swapping'); };
      pre.src = src;
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
    /* ---- zoom & pan dell'immagine: pizzica, trascina, doppio-tocco ---- */
    var frame = $('.lbox__frame', lb) || lbImg;
    var z = { scale: 1, tx: 0, ty: 0 }, pts = {}, pinch = null, pan = null, lastTap = 0;
    function applyZoom(animate) {
      if (z.scale <= 1.001 && z.tx === 0 && z.ty === 0) {
        // a riposo: niente transform inline, cosi resta l'animazione d'apertura CSS
        lbImg.style.transition = ''; lbImg.style.transform = ''; lb.classList.remove('is-zoomed');
        return;
      }
      lbImg.style.transition = animate ? 'transform .28s var(--ease)' : 'none';
      lbImg.style.transform = 'translate(' + z.tx + 'px,' + z.ty + 'px) scale(' + z.scale + ')';
      lb.classList.add('is-zoomed');
    }
    function clampPan() {
      var mx = Math.max(0, (z.scale - 1) * lbImg.offsetWidth / 2);
      var my = Math.max(0, (z.scale - 1) * lbImg.offsetHeight / 2);
      z.tx = clamp(z.tx, -mx, mx); z.ty = clamp(z.ty, -my, my);
    }
    function resetZoom() { z.scale = 1; z.tx = 0; z.ty = 0; pinch = pan = null; pts = {}; applyZoom(false); }
    function toggleZoom() { if (z.scale > 1.01) { resetZoom(); } else { z.scale = 2.6; z.tx = 0; z.ty = 0; applyZoom(true); } }
    function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
    frame.addEventListener('pointerdown', function (e) {
      if (frame.setPointerCapture) try { frame.setPointerCapture(e.pointerId); } catch (x) {}
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) { pinch = { d0: dist(pts[ids[0]], pts[ids[1]]) || 1, s0: z.scale }; pan = null; }
      else if (ids.length === 1) {
        var now = Date.now();
        if (now - lastTap < 300) { toggleZoom(); lastTap = 0; }
        else { lastTap = now; }
        pan = z.scale > 1.01 ? { x: e.clientX, y: e.clientY, tx: z.tx, ty: z.ty } : null;
      }
    });
    frame.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (pinch && ids.length >= 2) {
        z.scale = clamp(pinch.s0 * (dist(pts[ids[0]], pts[ids[1]]) / pinch.d0), 1, 4);
        clampPan(); applyZoom(false);
      } else if (pan && ids.length === 1) {
        z.tx = pan.tx + (e.clientX - pan.x); z.ty = pan.ty + (e.clientY - pan.y);
        clampPan(); applyZoom(false);
      }
    });
    function endPointer(e) {
      delete pts[e.pointerId];
      var n = Object.keys(pts).length;
      if (n < 2) pinch = null;
      if (n === 0) { pan = null; if (z.scale <= 1.01) resetZoom(); }
    }
    frame.addEventListener('pointerup', endPointer);
    frame.addEventListener('pointercancel', endPointer);
    frame.addEventListener('dblclick', function (e) { e.preventDefault(); toggleZoom(); });

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
    // su mobile ogni parola porta la sua foto (layout a card, no sovrapposizioni):
    // cloniamo l'immagine corrispondente dentro lo step. Su desktop resta nascosta.
    steps.forEach(function (s) {
      var i = parseInt(s.getAttribute('data-i'), 10); if (isNaN(i)) i = steps.indexOf(s);
      var src = imgs[i] && imgs[i].querySelector('img');
      if (src && !$('.vs__step-img', s)) {
        var fig = document.createElement('figure'); fig.className = 'vs__step-img';
        var im = document.createElement('img');
        im.src = src.getAttribute('src'); im.alt = src.getAttribute('alt') || ''; im.loading = 'lazy';
        fig.appendChild(im); s.insertBefore(fig, s.firstChild);
      }
    });
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
     CHECKLIST INTERATTIVA — Do's/Don'ts & approvazione
     ============================================================= */
  function checklist() {
    var root = document.getElementById('chk'); if (!root) return;
    var items = $$('.chk__item', root);
    var bar = $('#chkBar'), done = $('#chkDone'), tot = $('#chkTot'), state = $('#chkState'), reset = $('#chkReset');
    if (!items.length) return;
    if (tot) tot.textContent = items.length;
    function update() {
      var n = items.filter(function (i) { return i.classList.contains('is-on'); }).length;
      if (done) done.textContent = n;
      if (bar) bar.style.width = (n / items.length * 100) + '%';
      var ready = n === items.length;
      root.classList.toggle('is-ready', ready);
      if (state) state.textContent = ready ? 'Pronto alla pubblicazione' : (n === 0 ? 'Non pronto' : 'In revisione');
    }
    items.forEach(function (it) {
      it.setAttribute('aria-pressed', 'false');
      it.addEventListener('click', function () {
        var on = it.classList.toggle('is-on');
        it.setAttribute('aria-pressed', String(on));
        update();
      });
    });
    if (reset) reset.addEventListener('click', function () {
      items.forEach(function (i) { i.classList.remove('is-on'); i.setAttribute('aria-pressed', 'false'); });
      update();
    });
    update();
  }

  /* =============================================================
     UTIL
     ============================================================= */
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* =============================================================
     GALLERIA FOTOGRAFICA — carosello a tutto viewport (mobile)
     Avvolge la striscia in uno "stage", aggiunge i puntini di posizione
     e l'hint di swipe. Si attiva/disattiva al cambio di viewport.
     ============================================================= */
  function galleryMobile() {
    var strip = $('.fotostrip--xl'); if (!strip) return;
    var mq = window.matchMedia('(max-width: 760px)');
    var stage = null, nav = null, hint = null, dots = [], items = [], rafing = false, swiped = false;

    function build() {
      if (stage) return;
      items = $$('.fotostrip__item', strip);
      if (!items.length) return;
      stage = document.createElement('div'); stage.className = 'fotostrip-stage';
      strip.parentNode.insertBefore(stage, strip);
      stage.appendChild(strip);

      nav = document.createElement('div'); nav.className = 'fotostrip__nav';
      items.forEach(function (it, i) {
        var d = document.createElement('button');
        d.className = 'fotostrip__dot'; d.type = 'button';
        d.setAttribute('aria-label', 'Vai alla foto ' + (i + 1));
        d.addEventListener('click', function () { strip.scrollTo({ left: i * strip.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); });
        nav.appendChild(d); dots.push(d);
      });
      stage.appendChild(nav);
      if (dots[0]) dots[0].classList.add('on');

      hint = document.createElement('span'); hint.className = 'fotostrip__hint';
      hint.innerHTML = 'Scorri <b aria-hidden="true">›</b>';
      stage.appendChild(hint);
    }
    function teardown() {
      if (!stage) return;
      stage.parentNode.insertBefore(strip, stage);
      stage.remove(); stage = nav = hint = null; dots = []; items = [];
    }
    function apply() { if (mq.matches) build(); else teardown(); }

    strip.addEventListener('scroll', function () {
      if (!dots.length || rafing) return; rafing = true;
      requestAnimationFrame(function () {
        rafing = false;
        var idx = clamp(Math.round(strip.scrollLeft / strip.clientWidth), 0, dots.length - 1);
        dots.forEach(function (x, j) { x.classList.toggle('on', j === idx); });
        if (!swiped && strip.scrollLeft > 12 && hint) { swiped = true; hint.classList.add('gone'); }
      });
    }, { passive: true });

    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  }

  /* =============================================================
     CARD DI TESTO ESPANDIBILI — accordion su mobile per le card con
     corpo lungo (Mission/Vision/Promessa, ecc.): riduce il testo e
     aggiunge interazione. Solo le card con testo davvero lungo.
     ============================================================= */
  function expandables() {
    var cards = $$('.mvp__cell, .flow__step, .ger-node');
    cards.forEach(function (card) {
      var host = $('.body', card) || card;
      var ps = [], k = host.children;
      for (var i = 0; i < k.length; i++) if (k[i].tagName === 'P') ps.push(k[i]);
      if (!ps.length) return;
      var len = ps.reduce(function (a, p) { return a + (p.textContent || '').length; }, 0);
      if (len < 70) return; // niente accordion per testi di una riga
      var wrap = document.createElement('div'); wrap.className = 'exp__body';
      host.insertBefore(wrap, ps[0]);
      ps.forEach(function (p) { wrap.appendChild(p); });
      var chev = document.createElement('button'); chev.className = 'exp__chev'; chev.type = 'button';
      chev.setAttribute('aria-label', 'Mostra o nascondi il testo'); chev.setAttribute('aria-expanded', 'true');
      card.appendChild(chev);
      // testo VISIBILE di default: si puo solo richiudere col pulsante (niente testo nascosto a sorpresa)
      card.classList.add('exp', 'is-open');
      chev.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = card.classList.toggle('is-open');
        chev.setAttribute('aria-expanded', String(o));
      });
    });
  }

  /* =============================================================
     GALLERIA DI PAROLE — carosello swipe a schermo intero (mobile)
     Indicatori di posizione + hint di swipe per la sezione "voce".
     ============================================================= */
  function wordsGalleryMobile() {
    var sec = $('#voce-scroll'); if (!sec) return;
    var scroller = $('.vs__steps', sec); if (!scroller) return;
    var mq = window.matchMedia('(max-width: 860px)');
    var nav = null, hint = null, dots = [], steps = [], rafing = false, swiped = false;

    function build() {
      if (nav) return;
      steps = $$('.vs__step', scroller); if (!steps.length) return;
      nav = document.createElement('div'); nav.className = 'vs__nav';
      steps.forEach(function (s, i) {
        var d = document.createElement('button'); d.className = 'vs__dot'; d.type = 'button';
        d.setAttribute('aria-label', 'Vai alla parola ' + (i + 1));
        d.addEventListener('click', function () { scroller.scrollTo({ left: i * scroller.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); });
        nav.appendChild(d); dots.push(d);
      });
      sec.appendChild(nav); if (dots[0]) dots[0].classList.add('on');
      hint = document.createElement('span'); hint.className = 'vs__hint';
      hint.innerHTML = 'Scorri <b aria-hidden="true">›</b>'; sec.appendChild(hint);
    }
    function teardown() { if (!nav) return; nav.remove(); if (hint) hint.remove(); nav = hint = null; dots = []; steps = []; }
    function apply() { if (mq.matches) build(); else teardown(); }

    scroller.addEventListener('scroll', function () {
      if (!dots.length || rafing) return; rafing = true;
      requestAnimationFrame(function () {
        rafing = false;
        var idx = clamp(Math.round(scroller.scrollLeft / scroller.clientWidth), 0, dots.length - 1);
        dots.forEach(function (x, j) { x.classList.toggle('on', j === idx); });
        if (!swiped && scroller.scrollLeft > 12 && hint) { swiped = true; hint.classList.add('gone'); }
      });
    }, { passive: true });

    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  }

  /* =============================================================
     INIT
     ============================================================= */
  function init() {
    preloader();
    cursore();
    field();
    clock();
    heroCinema();
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
    checklist();
    galleryMobile();
    wordsGalleryMobile();
    expandables();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
