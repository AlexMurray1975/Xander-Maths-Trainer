#!/usr/bin/env python3
"""Bundle the built site into one self-contained HTML file.

Used to produce a shareable preview (an Artifact, an email attachment, a file on
a USB stick) where a folder of files is not practical. Fonts, images, CSS and JS
are inlined; cross-page links become hash routes handled in the page.

The real site does not use this — deploy the folder for that.

    python3 build.py && python3 bundle.py
"""

import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "preview.html"
PAGES = ["index", "fund", "states", "impact", "otaf", "team", "contact"]


def data_uri(path):
    p = ROOT / path
    mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    if p.suffix == ".woff2":
        mime = "font/woff2"
    return "data:%s;base64,%s" % (mime, base64.b64encode(p.read_bytes()).decode())


def inline_assets(html):
    """Replace src="assets/..." / href="assets/..." with data URIs."""
    return re.sub(
        r'(src|href)="(assets/[^"]+\.(?:jpg|png|svg|woff2))"',
        lambda m: '%s="%s"' % (m.group(1), data_uri(m.group(2))),
        html,
    )


def route_links(html):
    """Turn page-to-page links into hash routes, preserving any fragment."""
    def repl(m):
        page, frag = m.group(1), m.group(2) or ""
        if page not in PAGES:
            return m.group(0)
        extra = ' data-frag="%s"' % frag.lstrip("#") if frag else ""
        return 'href="#/%s"%s' % (page, extra)
    return re.sub(r'href="([a-z0-9]+)\.html(#[\w-]+)?"', repl, html)


def main():
    css = (ROOT / "assets/css/fonts.css").read_text() + "\n" + (ROOT / "assets/css/site.css").read_text()
    css = re.sub(r'url\(\.\./fonts/([^)]+)\)',
                 lambda m: "url(%s)" % data_uri("assets/fonts/" + m.group(1)), css)

    bodies = {}
    for name in PAGES:
        src = (ROOT / (name + ".html")).read_text()
        m = re.search(r"<main id=\"main\">(.*?)</main>", src, re.S)
        if not m:
            sys.exit("no <main> in %s.html" % name)
        bodies[name] = route_links(inline_assets(m.group(1)))

    header = re.search(r"<header class=\"hdr\">.*?</header>",
                       (ROOT / "index.html").read_text(), re.S).group(0)
    footer = re.search(r"<footer class=\"ftr\">.*?</footer>",
                       (ROOT / "index.html").read_text(), re.S).group(0)
    header = route_links(inline_assets(header)).replace(' aria-current="page"', "")
    footer = route_links(inline_assets(footer))

    js = ((ROOT / "assets/js/data.js").read_text() + "\n" +
          (ROOT / "assets/js/site.js").read_text())

    pages_json = ",\n".join(
        '"%s": %s' % (n, __import__("json").dumps(bodies[n])) for n in PAGES)

    router = """
var OI_PAGES = {%s};
(function () {
  var host = document.getElementById('main');
  function current() {
    var h = location.hash.replace(/^#\\//, '');
    return OI_PAGES[h] ? h : 'index';
  }
  function show(frag) {
    var name = current();
    host.innerHTML = OI_PAGES[name];
    document.querySelectorAll('.nav a').forEach(function (a) {
      var on = a.getAttribute('href') === '#/' + name;
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (window.OI) window.OI.initPage();
    var t = frag && document.getElementById(frag);
    if (t) t.scrollIntoView();
    else window.scrollTo(0, 0);
    document.title = 'Outrigger Impact';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (a) window.__oiFrag = a.getAttribute('data-frag') || '';
  });
  window.addEventListener('hashchange', function () {
    var f = window.__oiFrag; window.__oiFrag = '';
    show(f);
  });
  show('');
})();
""" % pages_json

    html = """<meta charset="utf-8">
<title>Outrigger Impact</title>
<meta name="description" content="Driving resilience in Big Ocean States — a preview of the Outrigger Impact Fund website.">
<style>
%s
/* Preview shell only: this file bundles all seven pages into one document and
   swaps between them on a hash route. The deployed site is ordinary multi-page HTML. */
.preview-note{position:fixed;left:50%%;bottom:14px;transform:translateX(-50%%);z-index:120;
  background:rgba(4,24,43,.92);color:#fff;border-radius:999px;padding:8px 18px;
  font:400 11.5px/1 var(--geo);letter-spacing:.09em;text-transform:uppercase;
  box-shadow:0 8px 28px -10px rgba(4,24,43,.7)}
.preview-note button{background:none;border:0;color:rgba(255,255,255,.55);cursor:pointer;
  margin-left:12px;font:inherit;padding:0}
.preview-note button:hover{color:#fff}
@media (max-width:560px){.preview-note{display:none}}
</style>

<a class="skip" href="#main">Skip to content</a>
%s
<main id="main"></main>
%s
<div class="preview-note" id="pnote">Single-file preview · all seven pages
  <button type="button" onclick="document.getElementById('pnote').remove()" aria-label="Dismiss">Dismiss</button>
</div>

<script>
%s
</script>
<script>
%s
</script>
""" % (css, header, footer, js, router)

    OUT.write_text(html, encoding="utf-8")
    print("Wrote %s (%.1f MB)" % (OUT.name, OUT.stat().st_size / 1e6))


if __name__ == "__main__":
    main()
