# Xander's Apps

This repo holds two self-contained, installable, offline web apps for Xander:

- **[Wizard Chess](chess/)** — a Harry Potter-style marble chess game (Gryffindor vs
  Slytherin), play the computer or a friend. See [`chess/`](chess/).
- **Maths Trainer** — Year 3 maths practice (below), at the repo root.

---

# Xander's Maths Trainer

A single-page, installable web app (PWA) that quizzes an 8-year-old on Year 3 (White Rose)
maths, ready for Year 4. All questions are generated procedurally across ten topics: place
value, addition & subtraction, times tables (3, 4, 8), fractions, money, length & perimeter,
mass & capacity, time, statistics and shape.

- **Works fully offline** once loaded; progress (stars, stickers, per-topic accuracy) is saved
  on the device via `localStorage`. No accounts, no backend, no analytics, no trackers.
- **Parent view:** press and hold the ⭐ star badge for 2 seconds to see per-topic accuracy
  (weakest first) and recent sessions.

## Files

- `index.html` — the whole app (HTML, CSS, JS inline).
- `manifest.webmanifest` — PWA metadata for "Add to Home Screen".
- `sw.js` — service worker providing offline support.
- `icons/` — app icons.

## Install on an iPad

1. Open the deployed URL in **Safari** on the iPad.
2. Tap the Share button → **Add to Home Screen**.
3. Launch it from the Home Screen — it runs full-screen and offline, and remembers progress.

## Updating

After editing any file, bump `CACHE_VERSION` in `sw.js` (e.g. `xmt-v1` → `xmt-v2`) so installed
devices pick up the new version on next launch.
