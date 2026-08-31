/* Outrigger Impact — site behaviour
   No dependencies. Every enhancement degrades to plain, readable HTML. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Header ---------------- */
  function header() {
    var hdr = $('.hdr'); if (!hdr) return;
    var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = $('.burger'), nav = $('#nav');
    if (!burger || !nav) return;
    var toggle = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      toggle(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1000) toggle(false); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function reveal() {
    var els = $$('.rv');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.dataset.delay || '0', 10);
        setTimeout(function () { el.classList.add('is-in'); }, d);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Count-up ---------------- */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    var render = function (el, v) {
      var dp = parseInt(el.dataset.dp || '0', 10);
      el.textContent = (el.dataset.prefix || '') +
        v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp }) +
        (el.dataset.suffix || '');
    };
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { render(el, parseFloat(el.dataset.count)); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = parseFloat(el.dataset.count), t0 = null, dur = 1150;
        io.unobserve(el);
        var step = function (ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          render(el, to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { render(el, 0); io.observe(el); });
  }

  /* ---------------- Accordions ---------------- */
  function accordions() {
    $$('.acc__btn').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.classList.toggle('is-open', !open);
      });
    });
  }

  /* ---------------- Number formatting ---------------- */
  /* The 20-state investment window is fund-allocation detail, so it is shown
     only on a page that opts in with data-show-window="yes" on <body>.
     No public page does. */
  function showWindow() { return document.body.dataset.showWindow === 'yes'; }

  var fmt = {
    int: function (n) { return n === null ? '—' : n.toLocaleString('en-GB'); },
    usd: function (n) { return n === null ? '—' : '$' + n.toLocaleString('en-GB'); },
    pct: function (n) { return n === null ? '—' : (n > 0 ? '+' : '') + n.toFixed(1) + '%'; },
    km2: function (n) { return n.toLocaleString('en-GB') + ' km²'; }
  };

  /* ---------------- Big Ocean States map ----------------
     Equirectangular, cut in the eastern Pacific so the map reads west to east
     in the order the fund describes its geography: Caribbean, then Atlantic and
     Indian Ocean, then Pacific. Degrees of longitude and latitude are the same
     size on screen, which is what lets the EEZ circles be drawn to true area.

     The coastline in assets/js/land.js is real GSHHS data, not a sketch. It is
     drawn faintly and only to let a reader place the states. */
  var LON_LEFT = -99, LON_SPAN = 294;    // 99W .. 195E — Belize on the left, Samoa on the right
  var LAT_TOP = 58, LAT_BOT = -48;
  var VBW = 1200, VBH, K;                // K = pixels per degree, both axes

  function px(lon) { return (((lon - LON_LEFT) % 360 + 360) % 360) * K; }
  function py(lat) { return (LAT_TOP - lat) * K; }

  function svgEl(n, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', n);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* Semi-axis, in degrees of latitude, of an ellipse whose area on the globe
     equals `km2`. Widening the longitude axis by 1/cos(lat) cancels the
     equirectangular stretch exactly, so the drawn area is true at any latitude. */
  var DEG_KM = 111.32;
  function eezAxes(km2, lat) {
    var r = Math.sqrt(km2 / Math.PI) / DEG_KM;
    return [r / Math.cos(lat * Math.PI / 180), r];   // [lon semi-axis, lat semi-axis]
  }

  /* Land rings arrive as [lon, lat] in -180..180. A ring that straddles the cut
     has to be unwrapped before it is projected, or it draws a line right across
     the map; and a ring can be visible at more than one 360-degree offset. */
  function landPaths() {
    if (!window.OI_LAND) return [];
    var out = [];
    window.OI_LAND.forEach(function (ring) {
      var lon = [], prev = null, i;
      for (i = 0; i < ring.length; i++) {
        var v = ring[i][0];
        if (prev !== null) v = prev + ((v - prev + 540) % 360) - 180;
        lon.push(v); prev = v;
      }
      var lo = Math.min.apply(null, lon), hi = Math.max.apply(null, lon);
      for (var k = -2; k <= 2; k++) {
        var a = lo + k * 360, b = hi + k * 360;
        if (b < LON_LEFT || a > LON_LEFT + LON_SPAN) continue;
        var d = '';
        for (i = 0; i < ring.length; i++) {
          d += (i ? 'L' : 'M') +
               ((lon[i] + k * 360 - LON_LEFT) * K).toFixed(1) + ' ' +
               py(ring[i][1]).toFixed(1);
        }
        out.push(d + 'Z');
      }
    });
    return out;
  }

  function map() {
    var shell = document.getElementById('map');
    if (!shell || !window.OI_STATES) return;
    K = VBW / LON_SPAN;
    VBH = Math.round((LAT_TOP - LAT_BOT) * K);

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + VBW + ' ' + VBH,
      'class': 'map-svg',
      role: 'img',
      'aria-label': 'Map of the ' + window.OI_STATES.length +
        ' Big Ocean States in Outrigger’s eligible geography, running west to east ' +
        'from the Caribbean through the Atlantic and Indian Ocean to the Pacific. ' +
        'Each state is drawn as a circle covering the true area of its exclusive ' +
        'economic zone. The same figures are listed in the table below.'
    });

    // tropical band — where almost every one of these states sits
    svg.appendChild(svgEl('rect', {
      'class': 'map-band', x: 0, y: py(23.4), width: VBW, height: py(-23.4) - py(23.4)
    }));

    // coastline silhouette
    var land = svgEl('g', { 'class': 'map-land' });
    landPaths().forEach(function (d) { land.appendChild(svgEl('path', { d: d })); });
    svg.appendChild(land);

    // graticule: equator and tropics
    var grid = svgEl('g', { 'class': 'map-grid' });
    [[0, 'Equator'], [23.4, 'Tropic of Cancer'], [-23.4, 'Tropic of Capricorn']].forEach(function (g) {
      grid.appendChild(svgEl('line', {
        x1: 0, x2: VBW, y1: py(g[0]), y2: py(g[0]),
        'stroke-dasharray': g[0] === 0 ? '' : '3 6'
      }));
      var t = svgEl('text', {
        'class': 'map-glabel',
        x: 8, y: py(g[0]) - 6, fill: 'rgba(255,255,255,.34)',
        'font-size': 8.5, 'letter-spacing': 1.4, 'font-family': 'Jost, sans-serif'
      });
      t.textContent = g[1].toUpperCase();
      grid.appendChild(t);
    });
    svg.appendChild(grid);

    // region labels, over their own clusters, reading west to east
    [['Caribbean', -70, 40],
     ['Atlantic & Indian Ocean', 30, 40],
     ['Pacific', 158, 40]].forEach(function (t) {
      var tx = svgEl('text', {
        'class': 'map-glabel',
        x: px(t[1]), y: py(t[2]), 'text-anchor': 'middle',
        fill: 'rgba(255,255,255,.42)', 'font-size': 11,
        'letter-spacing': 2.4, 'font-family': 'Jost, sans-serif'
      });
      tx.textContent = t[0].toUpperCase();
      svg.appendChild(tx);
    });

    // states, largest EEZ first so the small ones stay clickable on top
    var dots = svgEl('g', {});
    window.OI_STATES.slice().sort(function (a, b) { return b.eez - a.eez; }).forEach(function (s) {
      var x = px(s.lon), y = py(s.lat), ax = eezAxes(s.eez, s.lat);
      var g = svgEl('g', {
        'class': 'map-dot' + (s.w && showWindow() ? ' is-window' : ''),
        'data-region': s.r, tabindex: '0', role: 'button',
        'aria-label': s.n + '. Exclusive economic zone ' + fmt.km2(s.eez) +
                      '. Population ' + fmt.int(s.pop) + '.'
      });
      g.appendChild(svgEl('ellipse', {
        'class': 'eez', cx: x, cy: y,
        rx: (ax[0] * K).toFixed(2), ry: (ax[1] * K).toFixed(2)
      }));
      g.appendChild(svgEl('circle', { 'class': 'core', cx: x, cy: y, r: 1.9 }));
      // The discs overlap heavily in the Caribbean and the western Pacific, so
      // they are transparent to the pointer and this is the only hit target.
      // States are painted largest first, which leaves the small ones on top.
      g.appendChild(svgEl('circle', { 'class': 'hit', cx: x, cy: y, r: 7 }));

      var show = function () { tip(shell, s, x / VBW, y / VBH); g.classList.add('is-active'); };
      var hide = function () { hideTip(shell); g.classList.remove('is-active'); };
      g.addEventListener('mouseenter', show);
      g.addEventListener('mouseleave', hide);
      g.addEventListener('focus', show);
      g.addEventListener('blur', hide);
      g.addEventListener('click', function (e) { e.stopPropagation(); show(); });
      dots.appendChild(g);
    });
    svg.appendChild(dots);

    // scale key — a circle of exactly one million km², drawn at map scale
    var key = svgEl('g', { 'class': 'map-key' });
    var kr = eezAxes(1e6, -38)[1] * K, kx = px(-92) + kr, ky = py(-38);
    key.appendChild(svgEl('ellipse', {
      cx: kx, cy: ky, rx: (eezAxes(1e6, -38)[0] * K).toFixed(2), ry: kr.toFixed(2)
    }));
    var kt = svgEl('text', { 'class': 'map-glabel', x: kx, y: ky + 3.5, 'text-anchor': 'middle', 'font-size': 8,
      'letter-spacing': 1.1, 'font-family': 'Jost, sans-serif' });
    kt.textContent = '1M KM²';
    key.appendChild(kt);
    svg.appendChild(key);

    shell.appendChild(svg);

    var t = document.createElement('div');
    t.className = 'map-tip';
    t.setAttribute('aria-hidden', 'true');
    shell.appendChild(t);
    document.addEventListener('click', function () { hideTip(shell); });

    // region filter, shared with the table
    $$('[data-mapfilter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = btn.dataset.mapfilter;
        $$('[data-mapfilter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        $$('.map-dot', svg).forEach(function (d) {
          d.classList.toggle('is-dim', r !== 'all' && d.dataset.region !== r);
        });
        filterTable(r);
      });
    });
  }

  function tip(shell, s, fx, fy) {
    var t = $('.map-tip', shell); if (!t) return;
    t.innerHTML =
      '<div class="map-tip__t">' + esc(s.n) + '</div>' +
      '<dl>' +
      '<dt>EEZ</dt><dd>' + fmt.km2(s.eez) + '</dd>' +
      '<dt>Population</dt><dd>' + fmt.int(s.pop) + '</dd>' +
      '<dt>GDP per capita</dt><dd>' + fmt.usd(s.gdp) + '</dd>' +
      '<dt>GDP growth</dt><dd>' + fmt.pct(s.gr) + '</dd>' +
      '</dl>' +
      (s.w && showWindow() ? '<div class="small" style="margin-top:8px">Initial investment window</div>' : '');
    t.style.left = (fx * 100) + '%';
    t.style.top  = (fy * 100) + '%';
    t.classList.add('is-on');
  }
  function hideTip(shell) {
    var t = $('.map-tip', shell); if (t) t.classList.remove('is-on');
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- States table ---------------- */
  function statesTable() {
    var tb = $('#states-body'); if (!tb || !window.OI_STATES) return;
    drawRows(window.OI_STATES.slice().sort(function (a, b) { return b.eez - a.eez; }));

    $$('#states-table th[aria-sort]').forEach(function (th) {
      th.addEventListener('click', function () { sortBy(th); });
      th.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortBy(th); }
      });
      th.tabIndex = 0;
    });

    var search = $('#states-search');
    if (search) search.addEventListener('input', function () { applyFilters(); });
  }

  var curRegion = 'all';

  function drawRows(rows) {
    var tb = $('#states-body'); if (!tb) return;
    var cls = { Pacific: 'tag--pac', Caribbean: 'tag--car', AIS: 'tag--ais' };
    tb.innerHTML = rows.map(function (s) {
      return '<tr data-region="' + s.r + '" data-name="' + esc(s.n.toLowerCase()) + '">' +
        '<td>' + esc(s.n) + (s.w && showWindow() ? ' <span class="tag">Window</span>' : '') + '</td>' +
        '<td><span class="tag ' + cls[s.r] + '">' + (s.r === 'AIS' ? 'AIS' : s.r) + '</span></td>' +
        '<td class="num">' + fmt.int(s.eez) + '</td>' +
        '<td class="num">' + fmt.int(s.pop) + '</td>' +
        '<td class="num">' + fmt.usd(s.gdp) + '</td>' +
        '<td class="num">' + fmt.pct(s.gr) + '</td>' +
        '<td>' + (s.oda ? 'ODA' : 'Non-ODA') + '</td>' +
        '</tr>';
    }).join('');
    applyFilters();
  }

  function sortBy(th) {
    var key = th.dataset.key;
    var dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
    $$('#states-table th[aria-sort]').forEach(function (o) { o.setAttribute('aria-sort', 'none'); });
    th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
    var rows = window.OI_STATES.slice().sort(function (a, b) {
      var A = a[key], B = b[key];
      if (A === null) return 1;
      if (B === null) return -1;
      if (typeof A === 'string') return dir * A.localeCompare(B);
      return dir * (A - B);
    });
    drawRows(rows);
  }

  function filterTable(r) { curRegion = r; applyFilters(); }

  function applyFilters() {
    var q = ($('#states-search') && $('#states-search').value || '').trim().toLowerCase();
    var shown = 0;
    $$('#states-body tr').forEach(function (tr) {
      var ok = (curRegion === 'all' || tr.dataset.region === curRegion) &&
               (!q || tr.dataset.name.indexOf(q) > -1);
      tr.hidden = !ok;
      if (ok) shown++;
    });
    var c = $('#states-count');
    if (c) c.textContent = shown + (shown === 1 ? ' state' : ' states');
  }

  /* ---------------- KPI explorer ---------------- */
  function kpis() {
    var list = $('#kpi-list'); if (!list || !window.OI_KPIS) return;
    var draw = function (theme) {
      var rows = window.OI_KPIS.filter(function (k) { return theme === 'all' || k.th === theme; });
      list.innerHTML = rows.map(function (k) {
        return '<li>' +
          '<div><div class="card__num">KPI ' + k.no + '</div>' +
          '<div class="h3" style="font-size:1.15rem">' + esc(k.k) + '</div>' +
          '<div class="small" style="margin-top:6px">' + esc(k.th) + '</div></div>' +
          '<p style="margin:0">' + esc(k.m) + '</p>' +
          '</li>';
      }).join('');
    };
    draw('all');
    $$('[data-kpi]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('[data-kpi]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        draw(btn.dataset.kpi);
      });
    });
  }

  /* ---------------- Professional-investor gate ----------------
     Records the visitor's confirmation, then fetches the restricted fragment.
     Keeping the fragment out of every served page means fund terms and target
     returns are never delivered to, or indexed for, a general audience.

     This is an attestation, not an entitlement check. A static site cannot
     enforce eligibility; if Outrigger's compliance adviser requires
     enforcement, serve assets/data/investor-terms.html from behind an
     authenticated endpoint instead. */
  var GATE_KEY = 'oi.investor.confirmed';

  function gate() {
    var gateSection = document.getElementById('gate');
    var target = document.getElementById('gated');
    if (!gateSection || !target) return;

    var check = document.getElementById('gate-agree');
    var enter = document.getElementById('gate-enter');
    var status = document.getElementById('gate-status');
    var exit = document.getElementById('gate-exit');
    var reset = document.getElementById('gate-reset');

    function stored() {
      try { return sessionStorage.getItem(GATE_KEY) === 'yes'; } catch (e) { return false; }
    }

    function open() {
      if (target.dataset.loaded === 'yes') return;
      fetch('assets/data/investor-terms.html', { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(function (html) {
          target.innerHTML = html;
          target.dataset.loaded = 'yes';
          target.hidden = false;
          gateSection.hidden = true;
          if (exit) exit.hidden = false;
          initPage();
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        })
        .catch(function () {
          if (status) {
            status.dataset.state = 'err';
            status.textContent = 'Could not load this section. Please write to simon.dent@outriggerimpact.com and we will send the fund documentation directly.';
          }
        });
    }

    if (check && enter && gateSection.dataset.bound !== 'yes') {
      gateSection.dataset.bound = 'yes';
      check.addEventListener('change', function () { enter.disabled = !check.checked; });
      enter.addEventListener('click', function () {
        if (!check.checked) return;
        try { sessionStorage.setItem(GATE_KEY, 'yes'); } catch (e) { /* private mode */ }
        open();
      });
    }

    if (reset && reset.dataset.bound !== 'yes') {
      reset.dataset.bound = 'yes';
      reset.addEventListener('click', function () {
        try { sessionStorage.removeItem(GATE_KEY); } catch (e) { /* ignore */ }
        window.location.href = 'index.html';
      });
    }

    if (stored()) open();
  }

  /* ---------------- Contact form ---------------- */
  function form() {
    var f = $('#enquiry'); if (!f) return;
    var status = $('#form-status');
    f.addEventListener('submit', function (e) {
      var endpoint = f.getAttribute('action') || '';
      // Until a form endpoint is configured, fall back to the visitor's mail client.
      if (!endpoint || endpoint.indexOf('REPLACE') > -1) {
        e.preventDefault();
        var d = new FormData(f);
        var body = ['Name: ' + (d.get('name') || ''),
                    'Organisation: ' + (d.get('org') || ''),
                    'Email: ' + (d.get('email') || ''),
                    'Interest: ' + (d.get('interest') || ''),
                    '', d.get('message') || ''].join('\n');
        window.location.href = 'mailto:simon.dent@outriggerimpact.com' +
          '?subject=' + encodeURIComponent('Website enquiry — ' + (d.get('interest') || 'General')) +
          '&body=' + encodeURIComponent(body);
        if (status) {
          status.dataset.state = 'ok';
          status.textContent = 'Opening your email client. If nothing happens, write to simon.dent@outriggerimpact.com.';
        }
      }
    });
  }

  /* ---------------- Footer year ---------------- */
  function year() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* Chrome is bound once; page content can be initialised again after a swap,
     which is what the single-file preview build uses to move between pages. */
  function initPage() {
    reveal(); counters(); accordions();
    map(); statesTable(); kpis(); gate(); form(); year();
  }

  function init() { header(); initPage(); }

  window.OI = { initPage: initPage };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
