# Wizard Chess — Xander's Marble Duel

A Harry Potter-style chess game for Xander: **Gryffindor vs Slytherin** in carved
marble, on a marble board in a candle-lit Hogwarts great hall. Single-page,
installable, and works fully offline.

- **Play the computer** at three levels — *Apprentice* (just learning),
  *Wizard* (a good match), *Sorcerer* (very tricky) — or **Two Wizards** pass-and-play
  on one iPad.
- **Choose your house:** your army plays in Gryffindor red-and-gold or Slytherin
  green-and-silver, and always moves first (like the giant Hogwarts set).
- **Real-wizard mode by default:** no glowing squares, no hints — just the board.
  Grown-ups can turn learning helpers on in **⚙︎ Settings** (show legal moves,
  announce check, show last move).
- Full chess rules: castling, en passant, pawn promotion (choose your piece),
  check, checkmate, stalemate, plus draw by repetition / 50-move / insufficient
  material.
- No accounts, no backend, no analytics, no trackers. Sound effects and win/loss
  tally are stored on the device.

## Files

- `index.html` — the whole game (HTML, CSS, chess engine, AI and UI, all inline).
- `manifest.webmanifest` — PWA metadata for "Add to Home Screen".
- `sw.js` — service worker for offline support (scoped to this `/chess/` folder).
- `icons/` — app icons (marble knight crest).

## The chess engine

The move generator is validated with **perft** against the standard reference
positions (initial, Kiwipete, and three edge-case positions) at depths up to 5 —
so castling, en passant, promotion and check rules are provably correct. The
computer opponent uses negamax + alpha-beta search with piece-square tables,
MVV-LVA move ordering and iterative deepening under a per-move time budget.

## Install on an iPad

1. Open the deployed `/chess/` URL in **Safari**.
2. Tap the Share button → **Add to Home Screen**.
3. Launch "Wizard Chess" from the Home Screen — full-screen and offline.

## Updating

After editing any file here, bump `CACHE_VERSION` in `chess/sw.js`
(e.g. `wizchess-v1` → `wizchess-v2`) so installed devices pick up the new version.
