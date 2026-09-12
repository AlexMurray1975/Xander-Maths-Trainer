# Norland Place Parents

A prototype parent application for Norland Place School: what is on today, what the
children are supposed to be wearing, what is happening after school, and the same
information for any child on any day, week or term, with the school's standing
information and its notices in the same place.

It is a single-page, installable web app (PWA) with no backend. Open
[`index.html`](index.html), or install it to a home screen and it will run offline.

## What it does

**Today** answers the three questions a parent actually asks before eight in the
morning, per child: what are they wearing, what is on, and who collects them and when.
Anything the school needs from you appears above that, counted and dated. Beneath it
sits tomorrow, because the useful time to learn about swimming kit is the night before.

**Diary** shows any day, week or month, filtered to one child or both, with the
full timetable on a day, a kit summary on a week, and a term calendar by month.

**Notices** holds letters, consents, payments and events. Anything needing a reply
stays at the top until it is dealt with and is repeated on Today.

**School** is the reference section that does not change day to day: the school day,
term dates, uniform, lunch menus, clubs, sport, absence, contacts, fees, wraparound
care, health, travel, the Parents' Association, policies and lost property.

**Family** holds each child's record, the consents in force, who may collect them,
and what each adult in the family is told about.

**Uniform check** turns the derivation into a list you work through at the door: every
item worn, carried and packed for that child on that day, ticked off and remembered.
After three in the afternoon it opens on tomorrow, because that is when the bag is
packed. It is reached from the Wearing line on Today, from the child's page, and from
the uniform entry under School.

**Kit list** is the start-of-term version: everything the school requires, by year group,
ticked off against what is already in the cupboard, with what is left to buy, an
indicative total, and which items come from the outfitter rather than anywhere. It
filters to the outstanding items and copies them to the clipboard for whoever is doing
the shopping.

## Design decisions worth knowing

- **Answers, not sources.** The app does not show a uniform policy and a timetable and
  leave the parent to do the reasoning. It works out that today is summer uniform, that
  it is a swimming day, and that photographs mean blazers and no games kit, and says so
  in one line. That derivation is in `wearFor()`.
- **Everything is generated from today's date.** Terms, weeks, menus, fixtures and
  notices are computed from the current date, so the prototype looks live whenever it
  is opened. Append `?date=YYYY-MM-DD` to walk through any day of the year.
- **The house style is the school's, not a technology company's.** Navy shield crest,
  a wide letterspaced geometric sans for headings and labels, a slate blue utility strip
  carrying the term and the week, and a cool navy and white palette. Red appears only as
  a semantic colour for anything overdue.

## Files

- `index.html` — the whole application, with the CSS and JavaScript inline.
- `manifest.webmanifest` — metadata for "Add to Home Screen".
- `sw.js` — service worker for offline use. Bump `CACHE_VERSION` after any edit.
- `icons/` — the school's crest, keyed to transparency, and the app icons built from it.
- `DESIGN.md` — the design note: information architecture, content model, integration,
  data protection and what a real build would involve.

## Installing on a phone

Open the deployed URL in Safari or Chrome, then Share and **Add to Home Screen**. It
runs full screen and offline and remembers what has been read and dealt with, on the
device, in `localStorage`. There is no account, no backend, no analytics and no tracking.

## Status

This is an independent prototype and not an official Norland Place School application.
Children's names, staff names, menus, notices, fixtures and term dates are illustrative.
The names can be changed under Family; everything else follows from them.
