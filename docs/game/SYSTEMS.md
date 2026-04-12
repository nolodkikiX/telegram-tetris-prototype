# SYSTEMS

## MVP framing
This document breaks the Telegram Tetris MVP into production-friendly systems.

Because this is a falling-block puzzle game, some generic game-system labels are adapted:
- **combat/interactions** -> piece/board interactions
- **enemies/obstacles** -> board pressure, stack growth, speed, failure states

The goal is a realistic first version that is small, testable, and shippable.

---

## 1. Player / Controller

### Minimal version
- Touch controls for:
  - move left
  - move right
  - rotate
  - soft drop
  - hard drop
- Keyboard controls for desktop Telegram
- Input lock when game is over or paused
- Basic debounce so accidental double inputs do not break the game feel

### Dependencies
- Core board logic
- Piece state and movement validation
- UI layer for control buttons
- Scene state management

### Definition of done
- Player can complete a full session using touch controls on mobile
- Inputs feel responsive and predictable
- Invalid moves do not break game state
- Controls work both in active play and correctly disable in non-play states

---

## 2. Piece / Board Interactions

### Minimal version
- 10x20 board or another chosen standard board size
- Tetromino spawn system
- Collision checks against walls, floor, and placed blocks
- Rotation rules in a simple MVP-friendly form
- Piece locking when it lands
- Full line detection and line clear resolution
- Spawn next piece after lock/clear resolution

### Dependencies
- Player/controller input
- Board data model
- Score system
- Scene/game loop timing
- Rendering layer

### Definition of done
- Pieces spawn, move, rotate, land, and lock reliably
- Full lines clear correctly every time
- No board corruption after repeated play sessions
- Game remains stable through complete run cycles

---

## 3. Obstacles / Failure States

### Minimal version
- Increasing pressure through gravity speed escalation over time or by cleared lines
- Stack growth as the main failure pressure
- Game over when a new piece cannot spawn cleanly
- Optional simple pause when Mini App loses focus

### Dependencies
- Piece/board interactions
- Scene flow
- Score/progression system
- Telegram Mini App lifecycle handling

### Definition of done
- Difficulty increases during a run in a noticeable but readable way
- Game over triggers only when spawn/failure conditions are met
- Player clearly understands why the run ended
- Resume/pause behavior does not corrupt the board

---

## 4. Progression / Score

### Minimal version
- Score from line clears
- Current run score shown in HUD
- Personal best saved per Telegram player
- Optional counters for lines cleared and sessions played
- End-of-run result summary

### Dependencies
- Piece/board interactions
- Save/load system
- UI/HUD
- Telegram user identity binding

### Definition of done
- Score updates correctly during play
- End-of-run summary matches actual session result
- Best score persists across reopen/reload
- No player can accidentally lose saved best score through normal use

---

## 5. UI / HUD

### Minimal version
- Start screen
- Game screen with board and controls
- HUD with current score
- Optional next piece preview if included in MVP
- Pause overlay
- Game over screen with retry CTA
- Best score display on start and result screens
- Controls hint on first play or in menu

### Dependencies
- Scene flow
- Player/controller
- Score system
- Save/load system
- Telegram Mini App viewport/layout handling

### Definition of done
- User can understand what to do within seconds
- Core UI is readable on mobile screens
- Retry and start flows are obvious
- No critical overlap or layout breakage on common Telegram mobile sizes

---

## 6. Audio / Juice

### Minimal version
- Background music optional, can be skipped in earliest playable build
- Core sound effects:
  - move/rotate
  - lock
  - line clear
  - game over
- Small visual juice:
  - line clear flash
  - score update feedback
  - button press feedback
- Sound toggle in settings or pause menu

### Dependencies
- UI/HUD
- Piece/board interactions
- Scene flow

### Definition of done
- Audio and feedback improve clarity without reducing responsiveness
- Sound can be disabled
- Effects do not create visible input lag or visual clutter

---

## 7. Save / Load

### Minimal version
- Bind save data to Telegram user id
- Persist personal best score
- Persist basic stats if tracked
- Safe load on app open
- Graceful fallback for missing/corrupted save data

### Dependencies
- Telegram auth/session binding
- Progression/score system
- Backend or local persistence strategy

### Definition of done
- Returning player sees their saved best score reliably
- Missing save data does not crash the app
- Save format supports small future extensions without rewrite

---

## 8. Scene Flow

### Minimal version
- Launch -> loading/init -> main menu -> gameplay -> game over -> retry/menu
- Pause/resume handling
- Restart without full app refresh
- Safe recovery from Telegram app background/foreground changes where possible

### Dependencies
- All gameplay systems
- Telegram Mini App integration
- UI/HUD

### Definition of done
- Player can move through the full loop without dead ends
- Restart is fast and reliable
- No scene transition leaves stale state behind
- Mini App launch flow is stable from Telegram entry point

---

## Recommended implementation order
1. Scene flow skeleton
2. Piece/board interactions
3. Player/controller
4. Obstacles/failure states
5. Progression/score
6. UI/HUD
7. Save/load
8. Audio/juice

## Notes
- For MVP, prefer **simple reliable rotation rules** over perfect competitive-grade rule fidelity.
- If scope gets tight, cut background music before cutting control quality.
- If scope gets very tight, leaderboard should be cut before personal best persistence.
- "Strict Tetris" branding/rules should be treated carefully; an original block puzzle implementation is safer for launch.
