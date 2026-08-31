# Outrigger Impact — website

A static, dependency-free redesign of outriggerimpact.com, built from the
Outrigger Impact Fund pre-marketing presentation (2025).

Eight pages, no framework, no build step at runtime, no third-party requests.
Drop the folder on any static host and it works.

---

## Contents

| Page | What it covers |
|---|---|
| `index.html` | Home — the opportunity, value proposition, sectors, structure, status, partners |
| `fund.html` | Strategy, four investment models, capital structure, governance, terms, pipeline |
| `states.html` | The 35 Big Ocean States: interactive map, sortable dataset, regional allocation |
| `impact.html` | Standards, seven impact themes, the 14-KPI explorer, theory of change |
| `otaf.html` | The Technical Assistance Facility, its four workstreams, and an FAQ |
| `team.html` | The team, collective experience, and the Investment Committee |
| `news.html` | News index — announcements plus a reading list of third-party coverage |
| `news-first-close.html` | The 28 July 2026 first close press release, reproduced as issued |
| `investors.html` | **Restricted.** Fund terms, tranche sizing and target returns, behind an investor-status confirmation |
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

## How financial-promotion content is separated

The site is split into two zones, and the line between them is drawn at what the
first close press release already put on the public record.

**Public pages** carry only what the announcement carries: the $100m target size,
the first close, the blended structure described qualitatively, sectors, impact
objectives, team and governance. No target returns, no management fee, no ticket
size, no tranche amounts.

**`investors.html` is restricted.** It asks the visitor to confirm they are a
Professional Client or Eligible Counterparty, then fetches
`assets/data/investor-terms.html` and renders it. That fragment holds the terms
table, target IRRs, tranche sizing and the priced pipeline. Because it lives in a
separate file, it is never served inside an indexed page. The page is `noindex,
nofollow`, excluded from `sitemap.xml`, and both it and `assets/data/` are
disallowed in `robots.txt`.

**This is an attestation, not an entitlement check.** A static site cannot
enforce eligibility — a determined visitor can fetch the fragment directly. It
records and acts on a confirmation, which is the common practice for fund
websites, and it keeps the content out of search results. If Robert Quinn
Advisory require enforcement rather than attestation, serve
`assets/data/investor-terms.html` from behind an authenticated endpoint; nothing
else needs to change.

The single-file `preview.html` build omits the restricted area entirely and
substitutes an explanatory stub, because a preview file is made to be forwarded.

---

## Editing the site

Shared chrome (head, header, footer) lives once in `_src/partials/`. Page bodies
live in `_src/pages/`. A ~50-line script assembles them into the static HTML at
the top level:

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

Any static host: Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3. Upload the
contents of this directory (`_src/` and `build.py` are harmless to include, but
can be omitted). Point the domain at it and set `404.html` as the error page.

`.nojekyll` is present so GitHub Pages serves the directory as-is.

---

## Before it goes live

A short list of things that need a decision or a rights check — none of them
blocking, but all of them worth settling first.

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

   **The Nordic Development Fund logo is missing.** It could not be sourced.
   Until it arrives, the site renders "Nordic Development Fund" as a typographic
   wordmark, which looks deliberate rather than broken. Drop the file in as
   `assets/img/partners/nordic-development-fund.svg` (or `.png`) and rebuild —
   the build swaps it in automatically, no markup change needed. Any
   `{{logo:slug|Name}}` slot behaves the same way.

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

4. **The Outrigger logo is raster, not vector.** The best copy available in the deck is
   145×102px, too coarse to trace cleanly. The site uses the mark as an image
   alongside a live-text wordmark set in Jost, which is a close match to the
   original. If you have the original vector logo, replace `assets/img/mark.png`
   and `assets/img/logo-white.png` with SVG and the whole identity sharpens.

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
- **The dark panels are photographs, not flat colour.** Every `section.on-dark`
  and the footer carry a field of open ocean built from the one underwater shot
  in the deck (`assets/img/water-surface.jpg` for the mid-navy panels,
  `water-deep.jpg` for the abyss panels and footer, ~90KB the pair). The crop is
  mirror-tiled and cross-faded into a seamless column that darkens with depth,
  so a panel opens with near-surface light and bubbles and descends from there.
  A gradient scrim over the photograph holds the contrast: measured against the
  brightest 1% of each panel's background, the dimmest text on the site sits at
  4.6:1, above the WCAG AA threshold of 4.5. **If you change the scrim opacities
  in `site.css`, re-check that** — the water is bright enough that it is easy to
  push small print below AA without noticing.
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

`python3 bundle.py` (after `build.py`) produces `preview.html`: all seven pages
in one self-contained file, with fonts, images, CSS and JS inlined and the
navigation on hash routes. Useful for emailing a review copy or hosting a
preview. It is not how the site deploys — deploy the folder for that.
