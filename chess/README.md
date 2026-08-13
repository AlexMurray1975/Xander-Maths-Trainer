# Xander's Wizard Chess

A Harry Potter-style chess game for Xander: **Gryffindor vs Slytherin** in carved
marble, on a marble board in a candle-lit Hogwarts great hall. Single-page,
installable, and works fully offline.

- **Play the computer** at three levels — *Apprentice* (just learning),
  *Wizard* (a good match), *Sorcerer* (very tricky) — or **Two Wizards** pass-and-play
  on one iPad.
- **Choose your house:** your army plays in Gryffindor red-and-gold or Slytherin
  green-and-silver, and always moves first (like the giant Hogwarts set).
- **Real-wizard mode by default:** no glowing squares, no automatic hints — just
  the board. Grown-ups can turn learning helpers on in **⚙︎ Settings** (show legal
  moves, announce check, show last move).
- **"Show Me a Good Move" helper:** a button that draws a golden arrow to a strong
  move *only when tapped* — nothing appears unless asked — plus a one-line **wizard
  tip** on a parchment ribbon explaining *why* ("Free knight — nothing's guarding
  it!", "Careful — your queen was in danger!", "Checkmate — this wins the game!",
  "Castle to keep your king safe", and so on). Shown automatically when playing the
  computer, and can be added to Two Wizards in Settings.
- **Owl coach 🦉:** when playing the computer, a gentle note explains what happened
  whenever the computer captures one of your pieces ("you can grab it straight
  back!", "that happens to every wizard", "guard your big pieces") — encouraging,
  never naggy. On by default vs the computer; switch it off in Settings.
- **Learn mode 📖** (off by default; toggle in Settings): tap any piece — yours or
  the opponent's — to see gentle dots for how it can move, plus a one-line
  description of that piece ("The knight leaps in an L-shape…").
- **Capture graveyard + score:** each side shows its fallen enemies and a running
  points score, with a 👑 crown for whoever is ahead.
- **Chess clock ⏳** for Two Wizards: optional Off / 5 / 10 / 15-minute timers, chosen
  when you start. The active player's clock ticks and glows; running out of time
  loses the duel. Clocks pause while the menu is open.
- Settings are reachable from the home screen **and** the in-game pause menu (☰).
- Full chess rules: castling, en passant, pawn promotion (a pawn reaching the far
  side automatically becomes a Queen), check, checkmate, stalemate, plus draw by
  repetition / 50-move / insufficient material.
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
