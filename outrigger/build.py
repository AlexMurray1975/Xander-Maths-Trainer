#!/usr/bin/env python3
"""Assemble the static Outrigger Impact site.

Pages live in _src/pages/*.html and carry a short HTML-comment front matter
block (title / description / slug). Shared chrome lives in _src/partials/.
Output is plain static HTML written to this directory — there is no runtime
build step and no dependencies beyond the Python standard library.

    python3 build.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "_src"
PAGES = SRC / "pages"
PARTIALS = SRC / "partials"

NAV_KEYS = ["fund", "states", "impact", "otaf", "team", "news"]


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
        # search results — used for the restricted professional-investor area.
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

        out = page_head + page_header + "\n" + body.strip() + "\n\n" + footer
        (ROOT / (name + ".html")).write_text(out, encoding="utf-8")
        built.append(name + ".html")

    print("Built %d pages: %s" % (len(built), ", ".join(built)))


if __name__ == "__main__":
    main()
