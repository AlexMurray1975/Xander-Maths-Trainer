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
  var fmt = {
    int: function (n) { return n === null ? '—' : n.toLocaleString('en-GB'); },
    usd: function (n) { return n === null ? '—' : '$' + n.toLocaleString('en-GB'); },
    pct: function (n) { return n === null ? '—' : (n > 0 ? '+' : '') + n.toFixed(1) + '%'; },
    km2: function (n) { return n.toLocaleString('en-GB') + ' km²'; }
  };

  /* ---------------- Big Ocean States map ----------------
     A deliberately schematic projection: an equirectangular ocean field centred
     on the Pacific, with the states in their true relative positions. No
     coastlines are drawn — inventing them would be worse than omitting them. */
  var LON0 = 140;                 // antimeridian falls in the mid-Atlantic
  var LAT_TOP = 46, LAT_BOT = -50;
  var VBW = 1000, VBH;

  function px(lon) { return ((((lon - LON0 + 540) % 360) - 180) + 180) / 360 * VBW; }
  function py(lat) { return (LAT_TOP - lat) / (LAT_TOP - LAT_BOT) * VBH; }

  function svgEl(n, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', n);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function map() {
    var shell = document.getElementById('map');
    if (!shell || !window.OI_STATES) return;
    VBH = Math.round(VBW * (LAT_TOP - LAT_BOT) / 360);

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + VBW + ' ' + VBH,
      'class': 'map-svg',
      role: 'img',
      'aria-label': 'Schematic map of the ' + window.OI_STATES.length +
        ' Big Ocean States in Outrigger\u2019s eligible geography, plotted by longitude and latitude. ' +
        'The same figures are listed in the table below.'
    });

    // tropical band — where almost every one of these states sits
    svg.appendChild(svgEl('rect', {
      'class': 'map-band', x: 0, y: py(23.4), width: VBW, height: py(-23.4) - py(23.4)
    }));

    // dot field, echoing the Outrigger mark
    var field = svgEl('g', { 'class': 'map-field' });
    for (var la = LAT_BOT + 4; la < LAT_TOP; la += 6) {
      for (var lo = 0; lo < 360; lo += 6) {
        var yy = py(la);
        field.appendChild(svgEl('circle', {
          cx: (lo / 360) * VBW, cy: yy,
          r: (Math.abs(la) < 24 ? 1.15 : 0.8)
        }));
      }
    }
    svg.appendChild(field);

    // graticule: equator and tropics
    var grid = svgEl('g', { 'class': 'map-grid' });
    [[0, 'Equator'], [23.4, 'Tropic of Cancer'], [-23.4, 'Tropic of Capricorn']].forEach(function (g) {
      grid.appendChild(svgEl('line', {
        x1: 0, x2: VBW, y1: py(g[0]), y2: py(g[0]),
        'stroke-dasharray': g[0] === 0 ? '' : '3 6'
      }));
      var t = svgEl('text', {
        x: 8, y: py(g[0]) - 6, fill: 'rgba(255,255,255,.34)',
        'font-size': 8.5, 'letter-spacing': 1.4, 'font-family': 'Jost, sans-serif'
      });
      t.textContent = g[1].toUpperCase();
      grid.appendChild(t);
    });
    svg.appendChild(grid);

    // region labels, positioned over their own clusters
    [['Atlantic, Indian Ocean & South China Sea', 55, -38],
     ['Pacific', 176, -38],
     ['Caribbean', -70, 33]].forEach(function (t) {
      var tx = svgEl('text', {
        x: px(t[1]), y: py(t[2]), 'text-anchor': 'middle',
        fill: 'rgba(255,255,255,.42)', 'font-size': 10,
        'letter-spacing': 2.2, 'font-family': 'Jost, sans-serif'
      });
      tx.textContent = t[0].toUpperCase();
      svg.appendChild(tx);
    });

    // state points, largest EEZ first so small ones stay clickable on top
    var dots = svgEl('g', {});
    window.OI_STATES.slice().sort(function (a, b) { return b.eez - a.eez; }).forEach(function (s) {
      var x = px(s.lon), y = py(s.lat);
      var r = 2.4 + Math.sqrt(s.eez) / 750;
      var g = svgEl('g', {
        'class': 'map-dot' + (s.w ? ' is-window' : ''),
        'data-region': s.r, tabindex: '0', role: 'button',
        'aria-label': s.n + '. Exclusive economic zone ' + fmt.km2(s.eez) +
                      '. Population ' + fmt.int(s.pop) + '.'
      });
      g.appendChild(svgEl('circle', { 'class': 'halo', cx: x, cy: y, r: r * 2.6 }));
      g.appendChild(svgEl('circle', { 'class': 'core', cx: x, cy: y, r: r }));

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
      (s.w ? '<div class="small" style="margin-top:8px">Initial investment window</div>' : '');
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
        '<td>' + esc(s.n) + (s.w ? ' <span class="tag">Window</span>' : '') + '</td>' +
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

  function init() {
    header(); reveal(); counters(); accordions();
    map(); statesTable(); kpis(); form(); year();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
