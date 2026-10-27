# Handover

This is the complete Outrigger Impact website: every source file, the build
script, the deployable output, the verification suite, and the register of where
each claim on the site came from.

It was built for Outrigger by Conviction Capital. It is yours to run.

---

## The short version

You do not need a developer to change the wording on this site. You do need
someone to read §4 before they publish anything, because two of the pages sit
close to a regulatory line and the site is built to keep them on the right side
of it.

---

## 1 · What you have

```
build.py            assembles the site. Python standard library only.
bundle.py           packs the built site into one shareable preview.html
extract_copy.py     pulls all the site's text out for review in Word
tools/verify.py     checks contrast, overflow, console errors, and §4
_src/pages/         one file per page. This is where the words live.
_src/partials/      the header, footer and <head>, shared by every page
public/             the deployable site. This is what a host serves.
CLAIMS.md           every figure on the site, and where it came from. Read it.
README.md           how the build works, in detail
```

**No dependencies.** No npm, no framework, no build pipeline that rots. If
Python 3 runs, the site builds. That was a deliberate choice: a marketing site
that needs a toolchain to change a sentence stops getting changed.

## 2 · Making a change

```bash
python3 build.py          # _src/ -> public/
python3 tools/verify.py   # check it before anyone sees it
```

Edit the words in `_src/pages/`, not in `public/`. Anything you change in
`public/` is overwritten the next time the site builds.

`tools/verify.py` needs a browser to measure against:

```bash
pip install playwright pillow numpy
playwright install chromium
```

## 3 · Deploying

Any static host. Point it at **`public/`** and nothing else.

That is not a convenience, it is the security model: because the host only ever
sees `public/`, it cannot serve your sources, your build scripts, or `CLAIMS.md`
even if somebody misconfigures it. Keep that boundary.

On Vercel or Netlify: root directory `public`, no build command, no output
directory. On Vercel specifically, turn **off** "Include files outside root
directory".

## 4 · The part that matters: the regulatory perimeter

Outrigger Impact is the trading name of Oceanwide Limited, an Appointed
Representative of Robert Quinn Advisory LLP. Information about Outrigger Impact
Fund I — its strategy, capital structure, terms, fees and target returns — is a
**financial promotion** under FSMA 2000 s.21. It cannot be published on a public
website.

The site is built so that it describes the *firm* and never the *offer*. Fund
material goes to Professional Clients and Eligible Counterparties on request,
after the manager's eligibility checks.

**`tools/verify.py` enforces this.** It fails the build if a banned phrase
appears on a public page — tranche, management fee, target return, gross IRR and
others. Two pages carry documented exemptions, listed in the script with their
reasons. If you find yourself wanting to add a third, that is the moment to call
Robert Quinn rather than edit the list.

**Material changes to claims, named investors, figures, photography or the
public/private boundary should go back through the principal for approval.**

## 5 · Open items, before anything goes live

These are in `CLAIMS.md` in full. The ones that need a decision rather than a
keystroke:

1. **The ocean-share figure.** The site, and the published press release of
   28 July 2026, say Big Ocean States steward around 30% of the world's ocean.
   Working from the site's own VLIZ dataset, the figure is roughly 7% of the
   ocean, or about 17% of global EEZ area. It is overstated by roughly
   fourfold. It is a published claim by an FCA Appointed Representative and it
   engages the anti-greenwashing rule (ESG 4.3.1), so it is the manager's and
   Robert Quinn's to settle, not a website edit. **This is the most important
   item on the list.**
2. **Imagery.** The photography was generated, not photographed. Several
   captions name real organisations and real places. Either caption them as
   illustrations or obtain real photographs. The five team portraits need a
   separate answer: if they are generated, they are synthetic likenesses of five
   named people, and each of them should agree to it.
3. **The enquiry form has no endpoint.** It currently opens the visitor's own
   mail client, which the page says plainly. It needs a real endpoint before
   launch.
4. **Grantee consent.** Confirm each named grantee is content to be named, and
   that the expected-outcome figures are still right.
5. **Robert Quinn has not seen the Strategy page.**

## 6 · Can you just use Claude Code?

Yes, and that is the intended way to run this. Anyone at Outrigger can get a
Claude Code account, open this repository, and ask for changes in plain English:
"change the headline on the impact page", "add a news item about X", "the team
page needs a sixth person".

Three things to tell whoever does it:

- **Point them at `CLAIMS.md` and §4 above.** Claude is good at writing copy and
  has no way of knowing which sentences are load-bearing for FCA purposes unless
  it is told. It will otherwise cheerfully add the fund's terms to the site
  because they make the page more persuasive.
- **Always run `python3 tools/verify.py` before deploying.** Ask Claude to run
  it. It catches the mistakes that are invisible by eye: this suite found an
  invalid colour value, an accent that failed contrast at small sizes, and a
  class of headings rendering white-on-white, none of which looked wrong in a
  screenshot.
- **Edit `_src/`, never `public/`.** Claude will know this from `README.md`, but
  it is the one mistake that silently loses work.

## 7 · Keeping the register current

`CLAIMS.md` is the thing that makes this site defensible. It records every
figure, its source, and the decisions behind what is deliberately *not*
published.

When a claim on the site changes, change `CLAIMS.md` in the same commit. A claim
that changes on the site and not in the register is a claim nobody can check
later, and the register stops being worth having the moment it is out of date.

---

*Conviction Capital, October 2026.*
