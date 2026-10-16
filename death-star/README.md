# Xander's Death Star

An installable, offline web app (PWA) that turns Xander's learning into building the
**LEGO Star Wars Death Star** (£1,000). Each mission completed adds money to the
Death Star fund, and the Death Star on the home screen is built up panel by panel as
the fund grows.

The centrepiece is the real set's cross-section photograph. Unbuilt areas show as a dim
blueprint; each of ten rooms (£100 each) appears in full colour as it is paid for, from the
bottom deck upwards: Hangar Bay, Trash Compactor, Detention Block, Control Room, Tractor
Beam, Interrogation Cell, Chasm Bridge, Conference Room, Throne Room and, at £1,000, the
Superlaser. Rooms the current missions will build show as yellow scaffolding that fills as
they progress. A room gallery shows each room's photograph once it is built, ranks are
shown with minifigures, and the box is the prize card.

Images in `img/` are LEGO product photographs, for private family use only.

## Missions

| # | Mission | Reward | Status |
|---|---------|--------|--------|
| 1 | **Operation Twelve**: master every times table up to 12 × 12 | £200 (Hangar Bay, Trash Compactor) | Live |
| 2 | **Imperial Dispatch**: complete an English assignment | £50 (half of the Detention Block) | Live |
| 3 | Classified | up to £750 | Awaiting orders |

### How Mission 1 is earned

The mission screen shows the full 12 × 12 grid. Xander works through it one **series** at a
time, in this order (set in `CONFIG.seriesOrder`): the 1s and 10s first as early wins, then
the squares, then the 2, 5, 11, 3, 4, 9, 6, 8, 7 and 12 times tables.

1. **Training.** Each series has a *Briefing* (its 12 facts and a trick), *Assembly Line* (in
   order, with a counting ladder) and *Target Practice* (jumbled, misses come back). Each fact
   has 3 studs: a correct answer within 6 seconds lights one, a wrong one puts one out. Facts
   are shared, so 3 × 7 and 7 × 3 count as one; on the grid, coloured squares show studs lit.
2. **Series Check.** All 12 facts of the series, jumbled, no mistakes, within 60 seconds.
   Passing it nails the series and greys it out on the 12 × 12 grid (a times table greys its
   row and column; the squares grey the diagonal).
3. **Lord Vader's Inspection** unlocks when the whole grid is grey: 24 facts from the whole
   grid, no mistakes, at the same pace (120 seconds). Passing it on **3 different days**
   completes the mission and releases the £200.

A *Trench Run* (60-second sprint across the whole grid, weighted to weaker facts) is there
for extra practice. In Command controls a parent can mark a series as nailed (for example
the 1s and 10s, if Xander already knows them), change the time limit and the number of days.

### How Mission 2 is earned

The app cannot mark written work, so Mission 2 is approved by a parent. Xander taps
**Report to Command** when the assignment is finished; a parent checks it and taps
**Approve** in Command controls, which releases the £50 and shows the celebration the
next time the home screen opens. Approval can be withdrawn there too.

Money always fills the Death Star from the bottom deck upwards, whatever order the
missions are completed in, so a £50 reward builds half a room.

## Command (parent) controls

Press and hold the money panel on the home screen for 2 seconds, then enter the 4-digit
Command PIN (set the first time; changeable inside). The PIN stops Xander approving his own
missions. Shows per-fact progress,
inspection dates, recent sessions, a "mark as paid" toggle, the inspection rules and a reset.

## Adding the next mission

Edit `CONFIG.missions` near the top of the script in `index.html`. A mission of `type:'approval'`
needs no extra code; Mission 3 is a locked placeholder ready to be filled in.

## Files

- `index.html`: the whole app (HTML, CSS and JavaScript inline, no build step).
- `manifest.webmanifest`, `sw.js`, `icons/`: home-screen install and offline support.
- `.github/workflows/deploy-pages.yml`: publishes to GitHub Pages on every push to `main`.

Progress is stored on the iPad (`localStorage`); there are no accounts, servers or trackers.
Add the app to the Home Screen: Safari can clear data for websites that have not been visited
for a few weeks, but not for Home Screen apps. The app also asks the browser to keep its data.
After changing any file, bump `CACHE_VERSION` in `sw.js` so installed copies update.

## Install on an iPad

Open the published URL in Safari, tap Share, then **Add to Home Screen**.

## Deploying

- **GitHub Pages:** push this folder as the root of its own repository; the included
  workflow publishes it automatically.
- **Vercel:** import the repository; no build settings are needed (it is a static site).
