#!/usr/bin/env python3
"""Assemble the static Outrigger Impact site.

Pages live in _src/pages/*.html and carry a short HTML-comment front matter
block (title / description / slug). Shared chrome lives in _src/partials/.
Output is plain static HTML written to public/, which holds the deployable
site and nothing else: no sources, no build scripts, no internal documentation.
That separation is what a host is pointed at, so anything not in public/ cannot
be served by accident. There is no runtime build step and no dependencies
beyond the Python standard library.

    python3 build.py
"""

import html as html_mod
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUB = ROOT / "public"
SRC = ROOT / "_src"
PAGES = SRC / "pages"
PARTIALS = SRC / "partials"

NAV_KEYS = ["states", "strategy", "impact", "otaf", "team", "news"]

SITE_URL = "https://www.outriggerimpact.com/"

# Sitemap priorities. Any page not listed gets the default; 404 is excluded.
# The point of generating the sitemap rather than keeping it by hand is that a
# hand-kept list drifts: otaf-portfolio.html was missing from it for weeks,
# having already gone missing from the preview bundle's page list for the same
# reason. A page that exists is now in the sitemap whether or not anyone
# remembered to add it.
SITEMAP_PRIORITY = {
    "index": "1.0",
    "states": "0.9",
    "impact": "0.9",
    "strategy": "0.9",
    "otaf": "0.8",
    "otaf-portfolio": "0.8",
    "news": "0.8",
    "news-first-close": "0.8",
}
SITEMAP_DEFAULT = "0.7"


def write_sitemap(names, out):
    """Write sitemap.xml for the built pages.

    No <lastmod>. A build-time date would say every page changed whenever any
    page did, and a date that is not true is worse than no date at all: the
    element is optional, and search engines discount one they cannot trust.
    """
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for name in names:
        loc = SITE_URL if name == "index" else SITE_URL + name + ".html"
        lines += ["  <url>",
                  "    <loc>%s</loc>" % loc,
                  "    <priority>%s</priority>" % SITEMAP_PRIORITY.get(name, SITEMAP_DEFAULT),
                  "  </url>"]
    lines.append("</urlset>")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")

LOGO_DIR = "assets/img/partners"
TILE_DIR = "assets/img/pipeline"


def fill_tiles(text, root):
    """Expand {{tile:slug}} into an <img> when the file exists, or nothing.

    Same idea as fill_logos: an image drops into assets/img/pipeline/<slug>.jpg
    and appears on the next build with no markup change. Until then the tile
    falls back to its own gradient, which is why this emits nothing rather than
    an <img> pointing at a file that is not there. Nine broken-image icons in a
    grid is worse than nine plain tiles.

    The images are decorative: the project type and the instrument are set in
    text on top of each tile, so alt is empty by design.
    """
    def repl(m):
        slug = m.group(1)
        for ext in (".jpg", ".webp", ".png"):
            f = root / TILE_DIR / (slug + ext)
            if f.exists():
                return ('<img src="%s/%s%s" alt="" loading="lazy" '
                        'width="900" height="675">' % (TILE_DIR, slug, ext))
        return ""

    return re.sub(r"\{\{tile:([a-z0-9-]+)\}\}", repl, text)


def fill_logos(text, root):
    """Expand {{logo:slug|Name}} into an <img> when the file exists, or a
    typographic wordmark when it does not.

    This lets a logo drop into assets/img/partners/<slug>.png and appear on the
    next build, with no markup change, which is useful while third-party logo
    permissions are still being obtained.
    """
    def repl(m):
        slug, name = m.group(1), m.group(2)
        for ext in (".svg", ".png", ".jpg"):
            f = root / LOGO_DIR / (slug + ext)
            if f.exists():
                return '<img src="%s/%s%s" alt="%s" loading="lazy">' % (
                    LOGO_DIR, slug, ext, html_mod.escape(name, quote=True))
        return '<span class="logo-wordmark">%s</span>' % html_mod.escape(name)

    return re.sub(r"\{\{logo:([a-z0-9-]+)\|([^}]+)\}\}", repl, text)


def absolutise(html):
    """Make every same-site reference root-absolute.

    Used for 404.html alone. A not-found page is served at whatever address the
    visitor got wrong, so its own relative links resolve against that address
    rather than against the site root: hit /anything/wrong.html and the page
    arrives correctly but looks for its stylesheet at /anything/assets/, finds
    nothing, and renders as naked HTML with a broken logo. Every other page is
    only ever served from its own known path, so they keep relative paths and
    the site stays portable to a subdirectory.
    """
    return re.sub(
        r'(src|href)="(?!https?:|mailto:|data:|#|/)([^"]+)"',
        lambda m: '%s="/%s"' % (m.group(1), m.group(2)),
        html)


def strip_comments(html):
    """Remove HTML comments from a built page.

    The source files carry a running commentary: why a section exists, what was
    deliberately left off it, which figures disagree with each other, what still
    needs the principal's sign-off. That is worth keeping in _src/, where whoever
    maintains this next will read it. It has no business on the live site, where
    it is one View Source away from any visitor and reads as an internal memo
    about a regulated fund's own disclosure decisions.

    Doctype is not a comment and is untouched. No conditional comments are used
    anywhere in this site, and nothing in the output depends on a comment
    surviving, so the removal is unconditional.
    """
    return re.sub(r"<!--(?!\[if).*?-->", "", html, flags=re.S)


def front_matter(text):
    """Pull the leading <!-- key: value --> block off a page source."""
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, text[m.end():]


def main():
    head = (PARTIALS / "head.html").read_text(encoding="utf-8")
    header = (PARTIALS / "header.html").read_text(encoding="utf-8")
    footer = (PARTIALS / "footer.html").read_text(encoding="utf-8")

    sources = sorted(PAGES.glob("*.html"))
    if not sources:
        sys.exit("No pages found in %s" % PAGES)

    PUB.mkdir(exist_ok=True)
    built = []
    for path in sources:
        meta, body = front_matter(path.read_text(encoding="utf-8"))
        name = path.stem

        page_head = head
        for key, default in (("title", "Outrigger Impact"), ("description", ""), ("slug", "")):
            page_head = page_head.replace("{{%s}}" % key, meta.get(key, default))

        # `robots: noindex, nofollow` in a page's front matter keeps it out of
        # search results, used for the restricted professional-investor area.
        robots = meta.get("robots", "")
        page_head = page_head.replace(
            "{{robots}}",
            '\n<meta name="robots" content="%s">' % robots if robots else "")

        # `body:` in front matter adds attributes to <body>. Used by states.html
        # to opt into the investment-window flag on the map and table; the data
        # carries `w:` for every state but showing it is a per-page decision.
        bodyattr = meta.get("body", "")
        page_head = page_head.replace(
            "{{bodyattr}}", " " + bodyattr if bodyattr else "")

        # Child pages mark their section's nav item (news-first-close -> news).
        section = meta.get("section", name.split("-")[0])
        page_header = header
        for key in NAV_KEYS:
            marker = ' aria-current="page"' if key == section else ""
            page_header = page_header.replace("{{cur_%s}}" % key, marker)

        out = page_head + page_header + "\n" + fill_tiles(fill_logos(body.strip(), PUB), PUB) + "\n\n" + footer
        out = strip_comments(out)
        if name == "404":
            out = absolutise(out)
        (PUB / (name + ".html")).write_text(out, encoding="utf-8")
        built.append(name + ".html")

    order = ["index"] + sorted(n for n in
                               (b[:-5] for b in built) if n not in ("index", "404"))
    write_sitemap(order, PUB / "sitemap.xml")

    print("Built %d pages: %s" % (len(built), ", ".join(built)))
    print("Wrote sitemap.xml with %d URLs" % len(order))


if __name__ == "__main__":
    main()
