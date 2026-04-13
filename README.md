# Telegram Tetris Prototype

Minimal local prototype for Iteration 1 and early Telegram Mini App shell bootstrap for Iteration 2.

## Requirements
- Node.js 20+
- npm

## Run locally
```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Build
```bash
npm run build
```

## Controls
### Desktop
- `Left / Right` - move piece
- `Up` - rotate
- `Down` - soft drop
- `Space` - hard drop
- `Enter` - start and restart after game over
- `P` - pause and resume
- `R` - restart after game over

### Mobile
Use the on-screen buttons:
- tap start CTA
- left
- right
- rotate
- soft drop
- drop
- pause/resume
- after game over, tap move, rotate, or drop, or use the restart CTA to retry

## Runtime behavior
The UI shows a small runtime label, a short runtime-aware startup message appears before bootstrap resolves, and gameplay pauses/resumes when the tab or window is hidden or restored.

## Current state
- local Phaser prototype is playable end-to-end
- line clear, score, game over, restart, ghost piece, next-piece preview, minimal wall-kick-lite rotation, and minimal speed scaling work
- local best-score, last-score, last-level, last-lines, sessions-played, and total-lines-cleared persistence work through `localStorage` with quiet fallback
- a minimal line-clear flash, line-clear score pop, hard-drop landing impact, game-over new-best indicator, final level summary, and optional subtle haptics give brief feedback
- touch controls are present in a separate bottom zone, with clearer pause/resume state and paused-state dimming
- Telegram Mini App shell bootstrap is connected with quiet browser fallback if Telegram init fails
- runtime label indicates Telegram Mini App vs Browser preview
- a minimal start overlay shows title, local stats including last score, last level, and last lines, desktop/touch hints, a small haptics toggle, and a start CTA
- UI text clarity is tuned for high-DPI displays with capped render/text resolution plus an extra text-only clarity pass so Telegram Mini App HUD and buttons stay sharper without undoing the FPS-focused optimizations
- no backend
