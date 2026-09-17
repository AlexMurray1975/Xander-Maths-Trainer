#!/usr/bin/env python3
"""Extract the site's copy in reading order, for review outside the browser.

Walks the built pages and emits a structured record of every piece of text a
visitor sees: headings at their real level, standfirsts, body copy, list items,
table content, and the notes and sources that sit under them. Nothing is
summarised or reworded.

Two things are deliberately kept:

  * The distinction between a heading, a standfirst, body copy and a note. A
    reviewer marking up copy needs to know which is which, because the same
    sentence is fine as a note and too long as a standfirst.
  * The shared footer, once, at the end, rather than repeated on twelve pages.

Output is JSON on stdout, consumed by make_copy_doc.py.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUB = ROOT / "public"

# Reading order, which is the nav order rather than alphabetical.
PAGES = [
    ("index.html", "Home"),
    ("states.html", "Why Big Ocean States"),
    ("strategy.html", "Strategy"),
    ("impact.html", "Impact"),
    ("otaf.html", "Technical Assistance Facility"),
    ("otaf-portfolio.html", "Grant portfolio"),
    ("team.html", "Team"),
    ("news.html", "News"),
    ("news-first-close.html", "News: first close"),
    ("news-otaf-gef.html", "News: GEF support for OTAF"),
    ("contact.html", "Contact"),
    ("404.html", "Page not found"),
]

# class -> the role a reviewer needs to see
ROLE_BY_CLASS = [
    ("eyebrow", "LABEL"),
    ("crumb", "BREADCRUMB"),
    ("display", "H1"),
    ("h2", "H2"),
    ("h3", "H3"),
    ("h4", "H4"),
    ("person__n", "H3"),
    ("person__r", "ROLE"),
    ("lede", "STANDFIRST"),
    ("stat__n", "FIGURE"),
    ("stat__l", "FIGURE LABEL"),
    ("card__num", "LABEL"),
    ("notelabel", "LABEL"),
    ("note", "NOTE"),
    ("evidence", "NOTE"),
    ("small", "SMALL"),
    ("tag", "TAG"),
    ("btn", "BUTTON"),
    ("textlink", "LINK"),
    ("chip", "FILTER"),
]

BLOCK = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th",
         "figcaption", "blockquote", "caption", "button", "a", "div", "span",
         "label", "strong", "em", "time"}
SKIP_TREE = {"script", "style", "svg", "head", "noscript"}
# Void elements never receive an end tag. Pushing one onto the stack leaves it
# there for good, so every later close misses the depth check and capture stops
# silently for the rest of the page. This cost the grant portfolio page three of
# its four case studies before it was caught.
VOID = {"br", "img", "input", "meta", "link", "hr", "source", "col", "area",
        "base", "embed", "param", "track", "wbr"}


class Extract(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.stack = []          # (tag, classes)
        self.skip_depth = 0
        self.buf = []
        self.cur = None
        self.cur_depth = None    # len(self.stack) when the capture opened
        self.in_footer = False
        self.in_header = False

    # -- helpers ---------------------------------------------------------
    def role_for(self, tag, classes):
        for cls, role in ROLE_BY_CLASS:
            if cls in classes:
                return role
        if tag in ("h1",):
            return "H1"
        if tag in ("h2",):
            return "H2"
        if tag in ("h3",):
            return "H3"
        if tag in ("h4", "h5", "h6"):
            return "H4"
        if tag == "li":
            return "BULLET"
        if tag in ("td", "th"):
            return "CELL"
        if tag == "figcaption":
            return "CAPTION"
        if tag == "blockquote":
            return "QUOTE"
        if tag == "p":
            return "BODY"
        return None

    def flush(self):
        if self.cur is None:
            return
        text = re.sub(r"\s+", " ", "".join(self.buf)).strip()
        self.buf = []
        role, where = self.cur
        self.cur = None
        self.cur_depth = None
        if not text:
            return
        # A container that only wraps other blocks produces the same text twice;
        # drop anything already captured verbatim as the previous entry.
        if self.out and self.out[-1]["text"] == text:
            return
        self.out.append({"role": role, "text": text, "where": where})

    # -- parser ----------------------------------------------------------
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        if tag in SKIP_TREE:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag in VOID:
            # <br> is a line break in the copy and has to survive as one.
            if tag == "br" and self.cur is not None:
                self.buf.append(" \u2014 ")
            return
        if tag == "footer":
            self.flush(); self.in_footer = True
        if tag == "header":
            self.flush(); self.in_header = True
        # Never capture the sticky nav; it is chrome, identical on every page.
        if self.in_header:
            return
        self.stack.append((tag, classes))
        if tag in BLOCK:
            role = self.role_for(tag, classes)
            if not role:
                return
            where = "footer" if self.in_footer else "main"
            if self.cur is None:
                self.cur = (role, where)
                self.cur_depth = len(self.stack)
            elif not "".join(self.buf).strip():
                # An <li> or <td> that turns out to hold its own headings and
                # paragraphs should not swallow them into one run-on line. The
                # outer capture has produced no text yet, so hand it to the
                # child, which knows its real role.
                self.cur = (role, where)
                self.cur_depth = len(self.stack)
                self.buf = []

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if tag in SKIP_TREE:
            self.skip_depth = max(0, self.skip_depth - 1)
            return
        if self.skip_depth:
            return
        if tag == "header":
            self.in_header = False
            return
        if self.in_header:
            return
        if tag in BLOCK and self.cur is not None and self.cur_depth == len(self.stack):
            self.flush()
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        if tag == "footer":
            self.in_footer = False

    def handle_data(self, data):
        if self.skip_depth or self.in_header:
            return
        if self.cur is not None:
            self.buf.append(data)


def main():
    doc = {"pages": [], "footer": []}
    seen_footer = False
    for fname, label in PAGES:
        src = (PUB / fname).read_text(encoding="utf-8")
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        p = Extract()
        p.feed(src)
        p.flush()
        main_items = [i for i in p.out if i["where"] == "main"]
        foot_items = [i for i in p.out if i["where"] == "footer"]
        if not seen_footer and foot_items:
            doc["footer"] = foot_items
            seen_footer = True
        doc["pages"].append({
            "file": fname,
            "label": label,
            "title": title.group(1).strip() if title else "",
            "items": main_items,
        })
    json.dump(doc, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
