#!/usr/bin/env python3
"""Assemble the static Outrigger Impact site.

Pages live in _src/pages/*.html and carry a short HTML-comment front matter
block (title / description / slug). Shared chrome lives in _src/partials/.
Output is plain static HTML written to this directory. There is no runtime
build step and no dependencies beyond the Python standard library.

    python3 build.py
"""

import html as html_mod
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "_src"
PAGES = SRC / "pages"
PARTIALS = SRC / "partials"

NAV_KEYS = ["states", "impact", "otaf", "team", "news"]

LOGO_DIR = "assets/img/partners"


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

        # Child pages mark their section's nav item (news-first-close -> news).
        section = meta.get("section", name.split("-")[0])
        page_header = header
        for key in NAV_KEYS:
            marker = ' aria-current="page"' if key == section else ""
            page_header = page_header.replace("{{cur_%s}}" % key, marker)

        out = page_head + page_header + "\n" + fill_logos(body.strip(), ROOT) + "\n\n" + footer
        (ROOT / (name + ".html")).write_text(out, encoding="utf-8")
        built.append(name + ".html")

    print("Built %d pages: %s" % (len(built), ", ".join(built)))


if __name__ == "__main__":
    main()
