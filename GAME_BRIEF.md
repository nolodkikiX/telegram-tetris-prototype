# GAME_BRIEF

## Working title
**Telegram Tetris**

Alternative working names:
- Pocket Tetris
- Block Drop
- Tetra Rush

## Genre
Arcade puzzle game.

## Fantasy / Player fantasy
Player feels smart, fast, and in control while turning falling chaos into order.

The core fantasy is: **react quickly, place pieces cleanly, survive longer, and chase a better score.**

## Target platform
- **Primary:** Telegram Mini App
- **Secondary shell:** Telegram bot for launch, reminders, score updates, and lightweight social hooks
- **Devices:** Mobile-first, with desktop Telegram support

## Target session length
- Core session: **2 to 5 minutes**
- Quick retry loop: **instant restart**
- Designed for repeated short sessions

## Core loop
1. Open the game from Telegram
2. Start a run immediately
3. Rotate and place falling tetrominoes
4. Clear lines and prevent stack overflow
5. Increase score and speed over time
6. Lose, view result, and instantly restart or share score

## Key mechanics
1. **Falling tetromino control** with left/right movement, rotation, soft drop, and hard drop
2. **Line clearing** as the main scoring and board management mechanic
3. **Speed progression** that increases tension over time
4. **Score chasing** through survival time, cleared lines, and efficient play
5. **Instant retry loop** for fast repeat sessions

## MVP includes
- One polished Tetris game mode
- Telegram Mini App client
- Telegram bot entry point
- Touch controls optimized for mobile
- Score tracking per player
- Local run result screen
- Best score / simple stats
- Minimal onboarding or controls hint
- Pause / resume handling for Telegram app context
- Basic sound toggle and lightweight settings

## Explicitly not in MVP
- Multiplayer battles
- Complex cosmetics system
- Extensive progression/meta systems
- Story/campaign mode
- Multiple rule variants at launch
- Guilds/clans/social meta systems
- Large live ops event system
- Monetization complexity
- Deep account inventory/economy

## Suggested tech stack
If stack is not chosen yet, I recommend:

### Client
- **TypeScript**
- **React + Vite** for shell/UI
- **Phaser** for the actual game board and input/game loop
- **Telegram Mini Apps SDK**
- **Tailwind CSS** for menus and overlays

### Backend
- **Node.js + TypeScript**
- **Fastify** for a lightweight API
- Telegram bot integration via **grammY**
- **PostgreSQL** if storing player accounts, highscores, and simple stats
- For a very lean MVP, backend can initially be minimal and only store scores/profile data

### Infra
- Static client on **Vercel** or similar
- Backend on **Railway / Fly.io / Render / VPS**
- **Sentry** for error tracking
- Basic analytics for retention and session length

## Main risks
1. **Control quality risk**
   If mobile controls feel bad, the whole game feels bad immediately.

2. **Performance/input latency risk**
   Telegram Mini App wrappers add constraints, so responsiveness must stay sharp.

3. **Differentiation risk**
   Tetris is universally understood, but also compared against very polished existing versions.

4. **Session fit risk**
   The game must be frictionless enough for Telegram, with very fast launch and retry.

5. **Compliance/product risk**
   If branded as "Tetris", naming/licensing implications may exist. A safer path may be a block-falling game with original branding.

## Product direction summary
Build a **fast, polished, mobile-first block-falling puzzle game for Telegram** with excellent controls, instant restarts, and lightweight score-driven retention.
