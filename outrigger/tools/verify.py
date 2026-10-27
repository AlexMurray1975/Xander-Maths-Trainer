#!/usr/bin/env python3
"""Verify the built site: contrast, overflow, console errors, perimeter leaks.

Run this after every change, before anything is deployed:

    python3 build.py && python3 tools/verify.py

It checks four things, in order of how much trouble each has actually caused on
this site:

1. CONTRAST, measured rather than judged. Every text element's effective colour
   is read from the DOM, the page is screenshotted with all text blanked, and
   each element is compared against the brightest 1% of its own box. That is the
   hardest case a reader meets, and it is how three real defects were found that
   looked fine by eye: an invalid hex colour, an accent that measured 4.03:1 on
   paper, and a whole class of light-ground headings rendering white on white.
   AA thresholds: 4.5:1 for normal text, 3.0:1 for large.

2. HORIZONTAL OVERFLOW at desktop and phone width. Anything sticking out past
   the viewport, except where it sits inside a container that scrolls on purpose
   (wide tables).

3. CONSOLE ERRORS AND FAILED REQUESTS. A missing asset or a script error.

4. PERIMETER LEAKS. A word list of things that must never appear on a public
   page, because they are a financial promotion under FSMA 2000 s.21: the fund's
   terms, structure, fees and target returns. This is the check that stops a
   well-meaning edit putting the firm in breach. See CLAIMS.md section 4.

Requires Playwright and Chromium:

    pip install playwright && playwright install chromium

If they are not installed the script says so and exits non-zero rather than
pretending the site passed.
"""

import asyncio
import functools
import http.server
import io
import socketserver
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"

# Every built page. Derived rather than listed, so a new page is checked the day
# it is created instead of the day somebody remembers to add it here.
PAGES = sorted(p.stem for p in PUB.glob("*.html"))

# Things that must not appear on a public page. Lower-case; matched against the
# page's visible text. See CLAIMS.md section 4 for why each one is here.
BANNED = [
    "junior tranche", "first-loss", "gross irr", "net irr",
    "management fee", "carried interest", "hurdle rate",
    "investment window", "ticket size", "tranche",
    "target return", "target net", "5.5%", "17.0%", "6.0%", "18.0%",
]

# Two pages legitimately contain banned words, and both are deliberate. An
# exemption is listed here with its reason rather than quietly removed from
# BANNED, so that the guard keeps working everywhere else and anyone adding a
# third exemption has to justify it in writing.
EXEMPT = {
    # The press release is reproduced exactly as issued on 28 July 2026,
    # including "a catalytic junior tranche". Editing a published release to
    # satisfy a lint rule would be worse than the rule it breaks.
    "news-first-close": ["junior tranche", "tranche"],
    # The contact page states that the fund's terms and target returns are a
    # financial promotion and are NOT published here. The phrase appears inside
    # the sentence that prevents the leak.
    "contact": ["target return"],
}

# Text at or above these sizes is "large" for the purposes of AA.
LARGE_PX = 24.0
LARGE_BOLD_PX = 18.66

SELECTOR = (
    "p, h1, h2, h3, h4, h5, h6, li, td, th, span, a, button, figcaption, "
    "label, caption, blockquote, figure, time, strong, em"
)


def fail(msg):
    print("\n%s" % msg)
    sys.exit(1)


try:
    import numpy as np
    from PIL import Image
    from playwright.async_api import async_playwright
except ImportError as e:
    fail("verify.py needs Playwright, Pillow and numpy:\n"
         "    pip install playwright pillow numpy\n"
         "    playwright install chromium\n"
         "(missing: %s)" % e.name)


def _lin(c):
    c = np.array(c, dtype=float) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _lum(rgb):
    r, g, b = _lin(rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg):
    a, b = _lum(fg), _lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def parse_rgb(css):
    nums = css.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",")
    return [float(n) for n in nums[:3]]


async def check_page(browser, base_url, name, width, do_contrast):
    """Returns (errors, overflow, leaks, contrast_failures)."""
    ctx = await browser.new_context(viewport={"width": width, "height": 900},
                                    device_scale_factor=1)
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text)
            if m.type == "error" and "favicon" not in m.text.lower() else None)
    page.on("requestfailed", lambda r: errors.append("failed request: " + r.url))

    await page.goto("%s/%s.html" % (base_url, name))
    # Reveal-on-scroll would otherwise leave most of the page at opacity 0, and
    # an element nobody can see cannot have its contrast measured.
    await page.add_style_tag(content=".rv{opacity:1!important;transform:none!important}"
                                     ".hdr{position:static!important}")
    await page.evaluate("() => document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; })")
    await page.wait_for_timeout(900)

    overflow = await page.evaluate("""() => {
      // The question is whether the PAGE scrolls sideways. An SVG child whose
      // box runs past the edge is clipped by its viewBox and costs nothing.
      const doc = document.documentElement;
      if (doc.scrollWidth <= doc.clientWidth + 1) return [];
      const W = doc.clientWidth, out = [];
      document.querySelectorAll('body *').forEach(el => {
        if (el.ownerSVGElement || el.tagName === 'svg') return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.right <= W + 1) return;
        if (el.classList.contains('skip')) return;
        let n = el;
        while (n) {
          const s = getComputedStyle(n);
          if (s.overflowX === 'auto' || s.overflowX === 'scroll') return;
          n = n.parentElement;
        }
        out.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
      });
      return [...new Set(out)].slice(0, 5);
    }""")

    # <main> only: the footer says these things are *not* published, so
    # scanning it would flag the disclaimer that prevents the leak.
    text = (await page.inner_text("main")).lower()
    allowed = EXEMPT.get(name, [])
    leaks = [w for w in BANNED if w in text and w not in allowed]

    fails = []
    if do_contrast:
        items = await page.evaluate("""(SEL) => {
          const out = [];
          document.querySelectorAll(SEL).forEach(el => {
            if (!el.textContent.trim()) return;
            if ([...el.children].some(c => c.textContent.trim())) return;  // leaf nodes only
            if (el.closest('[aria-hidden="true"]')) return;   // decoration, not read
            if (el.ownerSVGElement) return;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') return;
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) return;
            let op = 1, n = el;
            while (n && n !== document.body) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
            if (op < 0.05) return;
            out.push({t: el.textContent.trim().slice(0, 44), color: cs.color, op: +op.toFixed(3),
                      fs: parseFloat(cs.fontSize), fw: cs.fontWeight,
                      x: r.left + 2, y: r.top + window.scrollY + 2,
                      w: Math.max(r.width - 4, 1), h: Math.max(r.height - 4, 1)});
          });
          return out;
        }""", SELECTOR)

        await page.add_style_tag(content="body *{color:transparent!important;"
                                         "-webkit-text-fill-color:transparent!important}")
        await page.wait_for_timeout(350)
        shot = await page.screenshot(full_page=True)
        img = np.array(Image.open(io.BytesIO(shot)).convert("RGB"))

        for it in items:
            y0, y1 = int(max(it["y"], 0)), int(min(img.shape[0], it["y"] + it["h"]))
            x0, x1 = int(max(it["x"], 0)), int(min(img.shape[1], it["x"] + it["w"]))
            if y1 <= y0 or x1 <= x0:
                continue
            # Inset before sampling. A pill or rounded card has page background
            # in the corners of its bounding box, and the brightest 1% of that
            # box is the corner rather than anything behind the text: a white
            # label on a navy pill measured 1.04:1 until this was added.
            inset = int(min((y1 - y0) * 0.3, (x1 - x0) * 0.3, 6))
            if inset and (y1 - y0) > 2 * inset and (x1 - x0) > 2 * inset:
                band = img[y0 + inset:y1 - inset, x0 + inset:x1 - inset].reshape(-1, 3)
            else:
                band = img[y0:y1, x0:x1].reshape(-1, 3)
            bg = np.percentile(band, 99, axis=0)          # brightest 1%: the hardest case
            fg = np.array(parse_rgb(it["color"])) * it["op"] + bg * (1 - it["op"])
            r = ratio(fg, bg)
            large = it["fs"] >= LARGE_PX or (it["fs"] >= LARGE_BOLD_PX and int(it["fw"]) >= 700)
            need = 3.0 if large else 4.5
            if r < need:
                fails.append((round(r, 2), need, it["t"], round(it["fs"], 1)))

    await ctx.close()
    return errors, overflow, leaks, sorted(fails)


def serve(directory):
    """Serve public/ on a free port. Needed because fonts are blocked by CORS
    over file://, which otherwise reports a failed request on every page."""
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):   # one line per asset would bury the report
            pass

    handler = functools.partial(Quiet, directory=str(directory))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    httpd.allow_reuse_address = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, "http://127.0.0.1:%d" % httpd.server_address[1]


async def main():
    if not PAGES:
        fail("No built pages in %s. Run: python3 build.py" % PUB)

    httpd, base_url = serve(PUB)

    async with async_playwright() as pw:
        # Honour an explicit binary if one is set, which is how sandboxes and CI
        # images usually ship Chromium, before falling back to Playwright's own.
        import os, glob
        exe = os.environ.get("CHROMIUM_PATH") or next(
            iter(sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome"))[-1:]), None)
        try:
            browser = await (pw.chromium.launch(executable_path=exe) if exe
                             else pw.chromium.launch())
        except Exception as e:
            fail("Could not start Chromium. Either install it:\n"
                 "    playwright install chromium\n"
                 "or point CHROMIUM_PATH at an existing binary.\n(%s)" % e)

        bad = 0
        print("Checking %d pages at 1280px and 390px\n" % len(PAGES))
        for name in PAGES:
            errors, overflow, leaks, fails = await check_page(browser, base_url, name, 1280, True)
            _, overflow_m, _, _ = await check_page(browser, base_url, name, 390, False)

            problems = []
            if errors:
                problems.append("%d console error(s)" % len(errors))
            if overflow or overflow_m:
                problems.append("overflow")
            if leaks:
                problems.append("LEAK: " + ", ".join(leaks))
            if fails:
                problems.append("%d contrast failure(s)" % len(fails))

            status = "ok" if not problems else "; ".join(problems)
            print("  %-20s %s" % (name, status))
            for f in fails[:6]:
                print("        %5.2f (need %.1f)  %r  %.1fpx" % (f[0], f[1], f[2], f[3]))
            for o in (overflow or [])[:3]:
                print("        overflows at 1280px: %s" % o)
            for o in (overflow_m or [])[:3]:
                print("        overflows at 390px:  %s" % o)
            for e in errors[:3]:
                print("        %s" % e[:110])
            if problems:
                bad += 1

        await browser.close()
    httpd.shutdown()

    print()
    if bad:
        print("%d of %d pages have problems. Nothing should be deployed until this is clean."
              % (bad, len(PAGES)))
        sys.exit(1)
    print("All %d pages pass: contrast, overflow, console, perimeter." % len(PAGES))


if __name__ == "__main__":
    asyncio.run(main())
