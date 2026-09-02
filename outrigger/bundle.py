#!/usr/bin/env python3
"""Bundle the built site into one self-contained HTML file.

Used to produce a shareable preview (an Artifact, an email attachment, a file on
a USB stick) where a folder of files is not practical. Fonts, images, CSS and JS
are inlined; cross-page links become hash routes handled in the page.

The real site does not use this; deploy the folder for that.

    python3 build.py && python3 bundle.py
"""

import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUB = ROOT / "public"          # the deployable site; assets and pages live here
OUT = ROOT / "preview.html"    # deliberately outside public/, so it is never served
# Every page in _src/pages except 404, which has no route of its own. Derived
# rather than listed, because a hand-kept list silently dropped otaf-portfolio
# from the preview and left a link in it pointing at nothing.
PAGES = ["index"] + sorted(
    f.stem for f in (ROOT / "_src/pages").glob("*.html")
    if f.stem not in ("index", "404"))


def data_uri(path):
    p = PUB / path
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
    return re.sub(r'href="([a-z0-9-]+)\.html(#[\w-]+)?"', repl, html)


def main():
    css = (PUB / "assets/css/fonts.css").read_text() + "\n" + (PUB / "assets/css/site.css").read_text()

    # Inline every asset the stylesheet references, not just the fonts: the dark
    # panels pull their ocean photographs from CSS, and those were previously
    # left as relative URLs that resolve to nothing once the file is moved.
    css = re.sub(r'url\(\.\./([^)"\']+)\)',
                 lambda m: "url(%s)" % data_uri("assets/" + m.group(1)), css)

    bodies = {}
    for name in PAGES:
        src = (PUB / (name + ".html")).read_text()
        m = re.search(r"<main id=\"main\">(.*?)</main>", src, re.S)
        if not m:
            sys.exit("no <main> in %s.html" % name)
        bodies[name] = route_links(inline_assets(m.group(1)))

    header = re.search(r"<header class=\"hdr\">.*?</header>",
                       (PUB / "index.html").read_text(), re.S).group(0)
    footer = re.search(r"<footer class=\"ftr\">.*?</footer>",
                       (PUB / "index.html").read_text(), re.S).group(0)
    header = route_links(inline_assets(header)).replace(' aria-current="page"', "")
    footer = route_links(inline_assets(footer))

    js = ((PUB / "assets/js/data.js").read_text() + "\n" +
          (PUB / "assets/js/land.js").read_text() + "\n" +
          (PUB / "assets/js/site.js").read_text())

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
<meta name="description" content="Driving resilience in Big Ocean States: a preview of the Outrigger Impact Fund website.">
<style>
%s
/* Preview shell only: this file bundles every routed page into one document and
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
<div class="preview-note" id="pnote">Single-file preview · 9 pages
  <button type="button" onclick="document.getElementById('pnote').remove()" aria-label="Dismiss">Dismiss</button>
</div>

<script>
%s
</script>
<script>
%s
</script>
""" % (css, header, footer, js, router)

    # The page bodies are carried through the router as JSON, so their quotes
    # are backslash-escaped. Check against an unescaped copy or the guards below
    # only ever see the shell, which is how a whole missing page slipped past
    # them once already.
    probe = html.replace('\\"', '"')

    # A single-file bundle that still points at relative paths is broken by
    # definition: nothing resolves once it is published or emailed. Fail loudly
    # rather than shipping a preview with silently missing images.
    dangling = re.findall(r'url\(\.\.?/[^)]*\)|(?:src|href)="(?!data:|#|https?:|mailto:)[^"]+"', probe)
    dangling = [d for d in dangling if "assets/" in d or d.startswith("url(")]
    if dangling:
        sys.exit("unresolved asset references in the bundle:\n  " + "\n  ".join(sorted(set(dangling))))

    # route_links leaves a link untouched when its page is not in PAGES, so any
    # surviving .html href is a link to a page the bundle does not carry. Left
    # unchecked it fails silently: the visitor clicks and gets nothing, or is
    # quietly shown the home page.
    missing = sorted(set(re.findall(r'href="([a-z0-9-]+\.html)(?:#[\w-]+)?"', probe)))
    if missing:
        sys.exit("links to pages the bundle does not carry: " + ", ".join(missing) +
                 "\n(every page in _src/pages should be routed; check PAGES)")

    OUT.write_text(html, encoding="utf-8")
    print("Wrote %s (%.1f MB)" % (OUT.name, OUT.stat().st_size / 1e6))


if __name__ == "__main__":
    main()
