# Outrigger Impact — website

A static, dependency-free redesign of outriggerimpact.com, built from the
Outrigger Impact Fund pre-marketing presentation (2025).

Ten pages, no framework, no build step at runtime, no third-party requests.
Drop `public/` on any static host and it works.

---

## Contents

The deployable site is `public/`. Paths below, and everywhere else in this file,
are written relative to it: `assets/css/site.css` is
`public/assets/css/site.css` on disk. Everything outside `public/` — `_src/`,
the build scripts, `preview.html`, this file and `CLAIMS.md` — is working
material and is never served.

| Page | What it covers |
|---|---|
| `index.html` | Home — the organisation, the opportunity, geography, sectors, impact, OTAF, partners |
| `states.html` | The 35 Big Ocean States: the map, a sortable dataset, the three regions |
| `impact.html` | Standards, seven impact themes, the 14-KPI explorer, theory of change |
| `otaf.html` | The Technical Assistance Facility, its four workstreams, the grant timeline, and an FAQ |
| `otaf-portfolio.html` | The four OTAF grants to date — INVERSA, SarGas, ABALOBI, Positive Change for Marine Life |
| `team.html` | The team, collective experience, and the Investment Committee |
| `news.html` | News index — announcements plus a reading list of third-party coverage |
| `news-first-close.html` | The 28 July 2026 first close press release, reproduced as issued |
| `contact.html` | Enquiry routes and a contact form |
| `404.html` | Not-found page |

## What's interactive

- **Big Ocean States map** (`index.html`, `states.html`) — all 35 states plotted at
  their true longitude and latitude, sized by exclusive economic zone. Hover, tap
  or tab a point for its EEZ, population, GDP per capita and growth. The region
  filter drives both the map and the table below it.
- **Sortable dataset** (`states.html`) — sort any column, search by name.
- **KPI explorer** (`impact.html`) — filter the 14 indicators by impact theme.
- **FAQ accordion** (`otaf.html`), animated statistics, scroll reveals.

Everything degrades: with JavaScript off the pages are still complete and
readable, and the contact form falls back to a `mailto:` link. The one exception
is the restricted investor area, which requires JavaScript by design — without
it, nothing loads.

---

## Where the fund material is — and is not

**The fund proposition is not on this website at all.**

The site describes Outrigger the organisation: the Big Ocean States thesis, the
geography and its data, the six sectors thematically, the impact framework and
its objectives, OTAF, team and governance, partners, news, and the fact that
Fund I exists and reached first close on 28 July 2026. That is the whole of it.

Nowhere on these pages is there a capital structure, subordination mechanics,
regional allocation, terms, management fee, ticket size, target returns or
pipeline. Professional investors are directed to contact Simon Dent or Jeremy
Milward, and the material is provided on request after the manager's
eligibility checks.

**Why this rather than a gated area.** An earlier version put the proposition
on the site behind a self-certification checkbox. Compliance review was right
that this does not work: a promotion distributed publicly is not made private
by a tick-box or a footer saying it was only meant for professional clients,
and a static site cannot enforce eligibility in any case. Publishing nothing is
both simpler and stronger — there is no restricted area to secure, because
there is no promotion on the site to restrict. Robert Quinn Advisory approve a
corporate website rather than a financial promotion.

The gated version is in git history (`git log -- assets/data/investor-terms.html`)
if a password-protected investor area is ever wanted. It would need serving from
behind real authentication, not a checkbox.

**Public disclaimer register.** The footer says what these pages actually are —
informational, not an offer — and states plainly that fund information is a
financial promotion available on request to professional investors. It no
longer claims the website is "exclusively intended for Professional Clients"
while being served to everyone, which was the incoherence review identified.

`CLAIMS.md` is the substantiation register: every quantitative and
sustainability claim on the site, with source, status and who must approve it.
The FCA anti-greenwashing rule (ESG 4.3.1) applies to this fund's
sustainability claims, and the register is what makes the principal's approval
exercise tractable.

**Approval attaches to the site, not to the disclaimer.** Material changes to
claims, named investors, target figures, photography, logos or the boundary
between public and private material should go back through approval.

## The 2026 Impact Report, and what came off it

The *Outrigger Impact Report 2026* is the site's primary source for the impact
framework, the fund's targets, the eligible geography and the OTAF portfolio.
Two things about it govern how it is used.

**It is not itself publishable.** Its inside cover carries the full
financial-promotion disclaimer approved by Robert Quinn Advisory, including the
statement that the document is exclusively intended for Professional Clients and
Eligible Counterparties, and page 12 sets out the fund's blended structure and
investment models. It cannot be offered for public download. It goes to
professional investors on request, with the rest of the fund materials. The
website draws on the non-promotional parts of it and publishes those in its own
words.

**It disagrees with the press release, and the site follows the report.** The
announcement of 28 July 2026 quoted "2 million people", "more than 12,500 jobs"
and "1 million tonnes". The report's actual targets are 1.9m indirect
beneficiaries, 12,500 **direct beneficiaries** and 950,000 tCO₂e. Two of those
are rounding; "jobs" versus "direct beneficiaries" is not. The site now carries
the report's figures and the report's labels. `news-first-close.html` is
untouched — it reproduces the release as issued, and says so. Reconciling the
two is a decision for the manager; see `CLAIMS.md` §1.

## Dropping in images

Two image slots fill themselves from the filesystem, so a picture can be added
with no markup change:

- **Partner logos** — `public/assets/img/partners/<slug>.svg|png|jpg`. Until a
  file exists the build renders a typographic wordmark instead.
- **Pipeline tiles** — `public/assets/img/pipeline/<slug>.jpg|webp|png`, one per
  project type on the strategy page: `sanitary-landfill`, `waste-processing`,
  `alternative-materials`, `marine-protected-areas`, `wave-desalination`,
  `ecotourism`, `fleet-electrification`, `aquaculture`, `ocean-energy`. Until a
  file exists the tile falls back to its own gradient, which is deliberate:
  nine broken-image icons in a grid is worse than nine plain tiles.

Tile images are 4:3, decorative, and sit under a scrim that darkens the centre
where the type is. Run the contrast check again once real photographs are in.

## The October 2025 deck and case studies

Two further documents arrived in September 2026: version 3 of the pre-marketing
presentation, and a set of eleven pipeline case studies. Both pre-date the first
close, so the press release governs where they conflict. `CLAIMS.md` §13 records
what was taken from them and what was not.

Three things worth knowing without reading that section. **The deck's appendix
table is still row-shifted** — Fiji's EEZ sits on the Dominican Republic and
Fiji is given Grenada's figure. The site was corrected in August 2026; the deck
was not, so the error is going to investors. **The 30% ocean claim now has an
attribution**, to the UK SIDS Strategy 2023, which changes how it can be fixed
without making it true. And **the case studies name eleven counterparties**,
most of them in discussion rather than committed, with per-deal ticket sizes and
in one case a coupon. None of that is on the site: the pipeline is published by
project type and instrument only.

The grant portfolio is publishable where the fund proposition is not, because
OTAF makes grants rather than offering investments — nothing is offered and no
one is invited to engage in investment activity, so FSMA s.21 is not engaged.
Three drafting rules keep it that way, and they are set out in `CLAIMS.md` §7.
The short version: every figure on that page is an **expected** outcome agreed
at award, not a result, and the page says so.

## The design system, and where it departs from the handoff

The site follows the Design handoff (`Design_system_review_request`, home page,
high fidelity). Tokens, type scale, spacing, radii and copy are as specified.
Five things differ, all deliberate.

**The hero scrim is .58 at the top, not .42.** Design specifies a light top
stop and a `#8FD1F5` eyebrow over it. That eyebrow sits on bright sky —
measured at rgb(130,131,127) — where the cyan reaches 2.3:1 and even white only
3.8:1, against a 4.5:1 requirement for text that size. At .58 the eyebrow (now
white) measures 5.17:1 and the headline 5.09:1. The rest of the gradient is
exactly as specified. If the hero photograph is replaced, re-measure: a darker
image would let the top stop go back to .42.

**The footer keeps the full disclaimer.** The prototype's legal line is three
clauses long and drops the Appointed Representative statement. Outrigger Impact
is an AR of Robert Quinn Advisory and has to identify its principal, so the
approved wording stays in full. The handoff's own compliance note says the
footer disclaimer must not be altered without sign-off, which is why this reads
as a prototype simplification rather than an instruction. Everything else about
the footer — structure, wordmark, nav row, hairline, type — follows the design.

**The map stays live, and stays on one page.** The prototype uses a PNG of the
map on the home page, because a static prototype cannot carry an interactive
one. The real map has per-state tooltips, region filtering that also filters the
table, and an accessible label per state; a 2168px PNG has none of that and is
illegible on a phone. It therefore stays as SVG, on `states.html` only — putting
it back on the home page as well would restore the duplication that was removed
two revisions ago.

**Nav carries Team, not Partners.** The handoff lists a Partners route; there is
no partners page, only a section on the home page. There is a team page, which
the handoff did not see. Swap them back if a partners page gets built.

**The wordmark keeps the Outrigger mark.** The prototype's nav is a pure
typographic wordmark. The mark is retained beside it at 30px, per the client.

Two consequences worth knowing:

**`assets/img/water.jpg` is kept behind the dark panels.** The handoff makes
them flat navy and a gradient. The photograph sits underneath those specified
colours rather than in place of them, so the panels still read as Design's navy
and pick up the particulate and the falling light. See "The dark panels are a
photograph" below for the positions and the contrast method.

**No JavaScript is required for the design**, and none of it is decorative, but
the site still uses it for the map, the sortable states table, the KPI explorer
and the accordions. Every page remains complete and readable with scripting off.

## The map

`assets/js/site.js` draws it; `assets/js/land.js` holds the coastline; the state
data is in `assets/js/data.js`. Three things about it are deliberate.

**It runs west to east — Caribbean, then Atlantic and Indian Ocean, then
Pacific** — which is the order Outrigger describes its own geography in. The
projection is equirectangular, cut at 99°W in the empty eastern Pacific, and
spans 294° of longitude. `LON_LEFT` and `LON_SPAN` at the top of the map section
are the only two numbers that set this; everything else, coastlines included,
derives from them.

**The coastline is real GSHHS data, not a sketch.** An earlier version of this
site drew the continents by hand and they were wrong, which is worse than
drawing nothing. `land.js` is rings of `[lon, lat]` and nothing else, so the map
can be re-projected without regenerating it, and the data can be swapped for
another source without touching any code. See `CLAIMS.md` §11 on the licence.

**Each state's circle covers the true area of its exclusive economic zone.** Not
a symbol scaled to suggest area — the actual area, at the map's own scale. The
longitude semi-axis is widened by 1/cos(latitude), which cancels the
equirectangular stretch exactly, so the drawn area is right at any latitude. The
circle is centred on the state and says how much ocean, not which ocean; the
page says so, because several of these zones are island groups scattered over
thousands of kilometres and the real boundary looks nothing like a circle.

The discs overlap heavily in the Caribbean and the western Pacific, so they are
transparent to the pointer and a small invisible circle at each state's centre
is the only hit target. States are painted largest-first, which leaves the small
ones on top and reachable. Removing that would make Fiji unhoverable.

The map lives on `states.html` only, beside the dataset it belongs to. It used
to run on the home page as well, which meant a visitor met the same graphic
twice.

## Editing the site

Shared chrome (head, header, footer) lives once in `_src/partials/`. Page bodies
live in `_src/pages/`. A ~50-line script assembles them into static HTML in
`public/`:

```
python3 build.py
```

That is the only step. It needs nothing but Python 3 — no npm, no toolchain.
**Edit files in `_src/`, then run the build** — editing the generated
`*.html` files directly means your changes are lost on the next build.

Each page source starts with a short front-matter comment that sets its
`<title>`, meta description and canonical slug:

```html
<!--
title: The Fund — Outrigger Impact
description: Strategy, investment models, capital structure and terms…
slug: fund.html
-->
```

Data used by the interactive pieces — the 35 states, the 14 KPIs — is in
`assets/js/data.js`, one plainly-commented array each. Change a number there and
the map, the table and the KPI list all follow.

## Deploying

**`public/` is the site. Everything outside it is not.** Sources, build scripts,
the single-file preview and the internal documentation all sit in the parent
directory, so a host pointed at `public/` cannot serve them even by mistake.
That separation is structural rather than a matter of ignore-files or routing
rules, because the thing being kept off the web — `CLAIMS.md`, which records
what is unverified, unlicensed or awaiting a decision — is exactly the file you
do not want to discover on the live site.

Any static host: Vercel, Netlify, Cloudflare Pages, S3. Upload the contents of
`public/`, point the domain at it, and set `404.html` as the error page.

### Continuous deployment from Git

Vercel or Netlify can watch the repository and redeploy on every push. Two
settings matter:

- **Root Directory:** `outrigger/public`. This is what keeps the sources and
  the internal notes off the web, so it is not optional.
- **Production Branch:** whichever branch carries the site. It defaults to the
  repository's default branch, which may not be the one being worked on.

`public/vercel.json` pins two behaviours. `cleanUrls: false` keeps `/states.html`
resolving as written — every internal link carries the extension, and turning
clean URLs on would put a redirect in front of all of them. And an
`X-Robots-Tag: noindex, nofollow` header covers the whole deployment, which is
right for a staging or review URL and covers assets as well as pages, unlike a
meta tag.

**Remove that header before launch.** The site otherwise ships the production
`robots.txt`, which invites indexing and points at the real sitemap; leaving the
header in place would quietly keep the launched site out of search results.

---

## Before it goes live

A short list of things that need a decision or a rights check — none of them
blocking, but all of them worth settling first.

0. **Grantee consent for the portfolio page.** INVERSA, SarGas, ABALOBI and
   Positive Change for Marine Life are named on `otaf-portfolio.html`, with
   grant amounts and expected outcomes. Each should confirm it is content to be
   named on Outrigger's public website and that the figures attributed to it are
   accurate. Their logos and photography are a separate permission again; the
   page currently uses neither.

1. **Logo permissions — get these in writing.** The photographs and partner
   logos are taken from the fund presentation. Two things need consent, and the
   second is the sharper one:

   - Confirm Outrigger holds web-usage rights to the photography.
   - **Confirm each institution consents to its logo being used, in the group it
     appears in.** Development finance institutions have strict brand
     guidelines, and using a logo to signal investment in a fund is a different
     ask from listing an organisation as a supporter. The EIB in particular
     should be asked explicitly. If consent is refused, delete the tile or
     replace it with the name — the grid reflows either way.

   The Nordic Development Fund logo was supplied by NDF and is in place
   (`assets/img/partners/nordic-development-fund.png`, native green on
   transparent). Any other logo can be added the same way: drop the file into
   `assets/img/partners/<slug>.svg|png` and rebuild — a `{{logo:slug|Name}}`
   slot swaps the image in automatically, and falls back to a typographic
   wordmark while the file is missing.

   **The Luxembourg–EIB Climate Finance Platform is shown under the EIB logo**,
   with a caption naming the platform, because the platform has no separate mark
   available here and the EIB manages it. If the platform has its own logo, add
   it as `assets/img/partners/luxembourg-eib-climate-finance-platform.svg` and
   point the slot at it.

2. **Check where Builders Vision belongs.** The September 2025 deck recorded
   Builders Vision and other family offices as committed to senior equity and
   senior debt, but the first close release names only the Nordic Development
   Fund and the Luxembourg–EIB Climate Finance Platform as cornerstone
   investors. Builders Vision therefore sits under "Partners & supporters"
   rather than "Anchor investors". If they are in fact an investor and content
   to be named, move the tile — it is one line in `_src/pages/index.html`.

3. **Team photographs are low-resolution.** They were extracted from the deck at
   roughly 100–380px and are shown small and in monochrome, which hides most of
   the softness. Replacing them with proper headshots (≥600px square) would be a
   visible improvement. Drop new files over `assets/img/team/*.jpg`.

4. **Nothing outstanding on the Outrigger logo.** Outrigger supplied the
   artwork at 500×350 with clean alpha, and the mark has been traced to vector:
   `assets/img/mark.svg` is 49 ellipses in the two brand blues, 5KB, sharp at
   any size. It drives the header, the footer and the favicons, which are now
   rendered from the vector geometry rather than upscaled. The supplied lockup
   is kept at native resolution as `assets/img/logo.png` for use elsewhere.

   The brand tokens in `site.css` were corrected to the exact values in the
   artwork: `--brand: #3871C1` and `--cyan: #51ADE5`, replacing the values
   sampled from the low-resolution deck copy.

   The wordmark is still live text set in Jost rather than traced letterforms —
   tracing type is a different job from tracing 49 ellipses, and live text stays
   selectable, searchable and accessible. Jost is a close match to the original.
   If the exact wordmark matters, send the vector lockup and it can replace the
   text.

5. **The regional allocation split.** The deck shows 35% / 25% / 25% with a 15%
   floating allocation across three columns, but the percentages sit outside the
   text flow, so which region carries the 35% cannot be read from the file with
   certainty. The site currently reads it as **Caribbean 35%, AIS 25%,
   Pacific 25%** — the natural column order. Please confirm, and correct
   `states.html` and `index.html` if it is the other way round.

6. **Contact form endpoint.** The form currently opens the visitor's mail client.
   To collect submissions instead, set an `action` on the `<form id="enquiry">`
   in `_src/pages/contact.html` pointing at a form service (Formspree, Netlify
   Forms, or your own handler) and rebuild. The JavaScript stands aside as soon
   as a real endpoint is present.

7. **Fund status.** The site reflects first close on 28 July 2026 and a final
   close anticipated in 2027. No first close *amount* is stated anywhere,
   because the press release does not give one — add it only if Outrigger
   intends it to be public. Update `_src/pages/index.html` and
   `assets/data/investor-terms.html` as the raise progresses.

8. **The footer disclaimer needs Robert Quinn's sign-off.** The site footer now
   carries the approved boilerplate from the first close release, with one
   change: the sentence recording the CSSF *pre-marketing* notification under
   Directive (EU) 2019/1160 has been dropped. Pre-marketing ends once marketing
   begins, so that sentence sat oddly on a first close announcement and would
   sit more oddly on a live site. It is retained verbatim on the press release
   page, which is reproduced as issued. **Please have Robert Quinn Advisory
   confirm both.**

9. **Two edits to the press release text.** It is otherwise reproduced word for
   word. "deliver more than US$100 million *to* catalytic funding" is set as
   "*of* catalytic funding", and a stray comma in "(6), Clean Water and
   Sanitation" is removed. Revert either if the issued wording must stand.

10. **Press links have no URLs.** The five third-party articles on `news.html`
   are listed as a reading list because the deck gave titles without links. Add
   `href`s in `_src/pages/news.html` when you have them.

## Notes on the build

- **Fonts are self-hosted** (`assets/fonts/`, ~270KB actually served). Inter,
  Jost and Newsreader, all under the SIL Open Font License. Nothing is fetched
  from Google Fonts, so no visitor IP addresses reach a third party — which
  matters for an EU-domiciled fund.
- **The map is deliberately schematic.** It is an equirectangular projection
  centred on the Pacific, drawn as an ocean dot field with the equator and
  tropics marked. No coastlines or boundaries are drawn: accurate ones would
  need geodata this build does not carry, and approximate ones would be worse
  than none. The states themselves are at their true coordinates.
- **Accessibility.** Semantic landmarks, one `<h1>` per page, a skip link,
  visible focus rings, `aria-current` on the active nav item, keyboard-reachable
  map points with descriptive labels, `aria-sort` on sortable columns, and a
  full `prefers-reduced-motion` path that disables every animation.
- **The dark panels are a photograph, not flat colour.** Every `section.on-dark`
  and the footer share one image, `assets/img/water.jpg` (1024×1199, 91KB): a
  single column of open ocean running from daylight at the surface to near-black
  at depth. Rather than ship two files, the mid-navy panels are positioned at 2%
  down that column and the abyss panels and footer at 35%, so the two surfaces
  are literally the same water at different depths. A gradient scrim over the
  photograph holds the contrast.

  **Do not push the deep sample to the bottom of the column.** It was at 99%,
  where the water is genuinely featureless: the file's own texture there
  measures 2.2 against 13.8 at the top, and under the scrim it then read as
  flat navy, so those panels looked as though the image had been left off them
  while the mid panels showed it. 35% keeps them visibly photographic and still
  clearly deeper than the shallow panels, at a p99 luminance of 37 against 53.

  **If you retune the scrim or the positions, re-measure text contrast.** The
  water is bright enough near the surface that it is easy to push small print
  below WCAG AA without it being obvious. The method: render the page with all
  foreground elements hidden to isolate the painted backgrounds, then check every
  text colour used on a dark panel against the *brightest 1%* of that panel, not
  its average. The current worst case is 4.68:1 against a 4.5 threshold. Judging
  this by eye does not work — an earlier setting looked fine and measured 3.93.

- **Logo order is alphabetical, and deliberately so.** Within each block, logos
  are sorted by the organisation's full name, ignoring a leading "The" and
  sorting on the name rather than the acronym — ORRAA under "Ocean Risk…", ICFA
  under "International Climate Finance…". It avoids implying a ranking between
  institutions, which matters when two of them are cornerstone investors. There
  is a note to this effect above the block in `_src/pages/index.html`; keep the
  order when adding a logo.
- **Logo groups carry meaning.** The home page separates anchor investors, OTAF
  backers and partners into three labelled blocks rather than one undifferentiated
  wall. That matters: on a page that is a financial promotion, an unlabelled grid
  implies every organisation in it has invested. The partners block says in as
  many words that inclusion does not indicate an investment.
- **Sources.** Figures come from the first close press release (28 July 2026)
  and the Outrigger Impact Fund presentation (2025), including the World Bank
  2024 indicators it cites. Where the two differ, the press release wins — the
  target fund size is $100m, not the deck's $100–125m range.

## Single-file preview

`python3 bundle.py` (after `build.py`) produces `preview.html`: all 9 routed pages
in one self-contained file, with fonts, images, CSS and JS inlined and the
navigation on hash routes. Useful for emailing a review copy or hosting a
preview. It is not how the site deploys — deploy the folder for that.
