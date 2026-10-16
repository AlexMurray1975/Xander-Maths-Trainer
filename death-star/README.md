# Xander's Death Star

An installable, offline web app (PWA) that turns Xander's learning into building the
**LEGO Star Wars Death Star** (£1,000). Each mission completed adds money to the
Death Star fund, and the Death Star on the home screen is built up panel by panel as
the fund grows. The centrepiece is a blueprint cross-section of the set with ten
rooms laid out as on the real set (75419), each worth £100, built from the bottom deck
upwards: Hangar Bay, Trash Compactor, Detention Block, Control Room, Tractor Beam,
Interrogation Cell, Chasm Bridge, Conference Room, Throne Room and, at £1,000, the
Superlaser. Built rooms take on the model's grey hull and dark interiors. Rooms the current
mission will build show as yellow scaffolding that fills as the mission progresses.

## Missions

| # | Mission | Reward | Status |
|---|---------|--------|--------|
| 1 | **Operation Twelve**: master the 12 times table | £200 (Hangar Bay, Trash Compactor) | Live |
| 2 | **Imperial Dispatch**: complete an English assignment | £50 (half of the Detention Block) | Live |
| 3 | Classified | up to £750 | Awaiting orders |

### How Mission 1 is earned

1. **Training.** Each of the 12 facts (1 × 12 to 12 × 12) is a LEGO brick with 3 studs.
   A correct answer within 6 seconds lights a stud; a wrong answer puts one out.
   Modes: *Briefing* (the table and the 10× + 2× trick), *Assembly Line* (in order, with
   a counting ladder), *Target Practice* (jumbled, misses come back), and *Trench Run*
   (60-second sprint, personal best recorded).
2. **Lord Vader's Inspection** unlocks when all 36 studs are lit: all 12 facts in a random
   order (either way round, e.g. 12 × 7 or 7 × 12), no mistakes, within 60 seconds.
3. Passing the Inspection on **3 different days** completes the mission and releases the £200.
   Requiring separate days checks that the table has been learned, not crammed.

The time limit and number of days can be changed in Command controls.

### How Mission 2 is earned

The app cannot mark written work, so Mission 2 is approved by a parent. Xander taps
**Report to Command** when the assignment is finished; a parent checks it and taps
**Approve** in Command controls, which releases the £50 and shows the celebration the
next time the home screen opens. Approval can be withdrawn there too.

Money always fills the Death Star from the bottom deck upwards, whatever order the
missions are completed in, so a £50 reward builds half a room.

## Command (parent) controls

Press and hold the money panel on the home screen for 2 seconds. Shows per-fact progress,
inspection dates, recent sessions, a "mark as paid" toggle, the inspection rules and a reset.

## Adding the next mission

Edit `CONFIG.missions` near the top of the script in `index.html`. A mission of `type:'approval'`
needs no extra code; Mission 3 is a locked placeholder ready to be filled in.

## Files

- `index.html`: the whole app (HTML, CSS and JavaScript inline, no build step).
- `manifest.webmanifest`, `sw.js`, `icons/`: home-screen install and offline support.
- `.github/workflows/deploy-pages.yml`: publishes to GitHub Pages on every push to `main`.

Progress is stored on the device (`localStorage`); there are no accounts, servers or trackers.
After changing any file, bump `CACHE_VERSION` in `sw.js` so installed copies update.

## Install on an iPad

Open the published URL in Safari, tap Share, then **Add to Home Screen**.

## Deploying

- **GitHub Pages:** push this folder as the root of its own repository; the included
  workflow publishes it automatically.
- **Vercel:** import the repository; no build settings are needed (it is a static site).
