# MVP_SCOPE

## Goal of MVP
Validate that a Telegram-native falling-block puzzle game can achieve:
- instant understanding with almost no tutorial
- smooth controls on mobile inside Telegram
- satisfying short sessions and fast retries
- repeat play through score chasing and simple retention hooks

## MVP player promise
"I can open Telegram, start immediately, play a clean block puzzle run, and instantly try to beat my score."

## In scope

### 1. Platform shell
- Telegram bot entry point
- Launch into Telegram Mini App
- Basic Telegram user/session binding

### 2. Core gameplay
- Single falling-block mode
- Standard tetromino-style piece spawning
- Left/right movement
- Rotation
- Soft drop
- Hard drop
- Automatic fall speed increase over time
- Full line clear detection
- Game over state

### 3. Score system
- Score gained from line clears
- Track best score per player
- Optional tracking for total lines cleared and total sessions played

### 4. UX
- Start screen
- In-game HUD for score and maybe next piece
- Game over screen
- Restart button
- Minimal controls hint/tutorial
- Pause/resume safety for app backgrounding
- Sound on/off toggle

### 5. Optional light retention
- Personal best display
- Daily challenge only if very cheap to implement
- Bot message hook to bring player back, only if it does not slow MVP

### 6. Ops/tech baseline
- Error logging
- Basic analytics for game starts, game overs, average session length, retries

## Out of scope
- Real-time multiplayer
- Matchmaking
- PvP score attacks
- Cosmetics shop
- Battle pass
- Complex progression systems
- Story mode
- Unlockable worlds/themes
- Large achievements system
- Social graph mechanics
- Advanced tournaments in first release

## Recommended MVP content shape
- 1 core mode
- 1 visual theme
- 1 control scheme tuned for mobile
- 1 scoring model
- 1 leaderboard at most, or only personal best if we want less backend scope

## Success criteria for MVP
- Player starts first session in under 10 seconds from launch
- Controls feel responsive and readable on a phone screen
- Restart loop is nearly instant
- Average session is short but encourages immediate replay
- No major input, timing, or rendering issues inside Telegram Mini App

## Suggested implementation order
1. Telegram Mini App shell and launch flow
2. Core board logic and tetromino gameplay
3. Mobile controls and responsiveness tuning
4. Scoring and game over flow
5. Persistent best score
6. Analytics, polish, audio, optional lightweight leaderboard

## Open questions
- Do we want strict classic Tetris rules or a simplified inspired version?
- Do we want hold piece and next queue in MVP, or keep the first version minimal?
- Are leaderboards important on day one, or is personal best enough?
- Should the game use original branding to avoid naming/licensing issues?

## Recommendation
For MVP, keep it focused:
**one excellent single-player falling-block mode with great controls, instant restart, and personal best tracking.**

That is the fastest route to a polished Telegram game people will actually replay.
