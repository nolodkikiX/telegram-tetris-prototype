# MVP_BACKLOG

## Priority rules
- **P0 must-have**: without this, MVP is not playable or not shippable
- **P1 should-have**: strongly improves quality and retention, but game can exist without it
- **P2 nice-to-have**: polish or extensions that should not delay first playable release

---

## P0 must-have

### Platform / bootstrap
- Telegram bot entry point
- Telegram Mini App launch flow
- Basic Telegram user binding/session init
- App loading/init state

### Core gameplay
- Board model
- Tetromino definitions
- Piece spawn logic
- Gravity/game tick
- Left/right movement
- Rotation
- Soft drop
- Hard drop
- Collision validation
- Piece lock logic
- Full line clear logic
- Next piece spawn after lock
- Game over detection
- Run restart

### Controls
- Mobile touch controls
- Keyboard controls for desktop fallback
- Input disable during pause/game over

### Score / progression
- Current score
- Score from line clears
- End-of-run result screen
- Personal best persistence

### UI / UX
- Main menu/start screen
- Gameplay screen
- HUD with score
- Retry CTA on game over
- Minimal controls hint
- Responsive mobile layout

### Save / load
- Load player data on launch
- Save personal best
- Safe fallback on empty save

### Stability
- No critical state corruption after long play
- No hard crash on background/foreground transitions
- Basic error logging

---

## P1 should-have

### Gameplay quality
- Next piece preview
- Speed scaling curve tuning
- Better rotation feel/wall kick-lite behavior
- Pause/resume flow
- Basic session stats, such as lines cleared

### Retention
- Best score shown on start screen
- Total sessions played
- Lightweight analytics events
- Bot re-entry message hook

### UX / polish
- Better onboarding hint overlay
- Haptic feedback on supported mobile devices if cheap
- Cleaner transition between game over and restart
- Settings menu with sound toggle

### Tech / production
- Backend persistence instead of local-only storage, if needed
- Basic anti-spam/rate-limit protection around score submissions

---

## P2 nice-to-have

### Social / replayability
- Simple leaderboard
- Share score back into Telegram
- Daily challenge mode
- Weekly best score board

### Game feel
- Sound effects expansion
- Background music
- Line clear animation polish
- Better visual theme and skins
- Particle effects and screen shake-lite feedback

### Depth / extensions
- Hold piece
- Multi-piece preview queue
- Additional game mode variants
- Achievements
- Cosmetic unlocks

---

## Recommended build order
1. Telegram launch flow
2. Playable board with falling pieces
3. Core controls and collision rules
4. Line clear + game over + restart
5. Score + best score save
6. UI pass for mobile readability
7. Pause/resume and stability fixes
8. Optional polish and retention hooks

## Release gate for first MVP
MVP is ready for first external testing when:
- a player can open from Telegram and start within seconds
- a full run can be played on mobile without confusion
- controls are responsive enough to feel fair
- game over, retry, and best score work reliably
- no major bugs corrupt the board or trap the player in broken state

## Scope cuts if timeline is tight
Cut in this order:
1. Background music
2. Daily challenge
3. Leaderboard
4. Bot reminder hooks
5. Advanced rotation improvements

Do **not** cut:
- control responsiveness
- line clear correctness
- restart speed
- best score persistence
- mobile readability
