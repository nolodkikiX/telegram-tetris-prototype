# ARCHITECTURE

## Architecture goal
Build the **smallest playable falling-block prototype** first, then wrap it in Telegram Mini App integration.

Priority order:
1. prove core gameplay works
2. prove it feels responsive on mobile
3. only then add minimal persistence if truly needed

Rule: if there is a choice between more polish and less complexity, choose less complexity.

---

## Approved stack

### Client
- **TypeScript**
- **Vite**
- **Phaser**

### Optional shell layer
- **Telegram Mini Apps SDK** in Iteration 2 only

### What is intentionally not approved yet
- React
- Tailwind
- Backend framework
- Database
- State management library
- Audio library beyond browser/Phaser basics
- Analytics SDKs
- Leaderboard services

Reason: none of those are required to prove the core gameplay loop.

---

## Why this stack
- **TypeScript** keeps game state logic safer and easier to refactor.
- **Vite** is the fastest path to a local playable build.
- **Phaser** is enough for board rendering, input, timing, and scene management without adding a UI framework too early.
- **Telegram Mini Apps SDK** should stay outside the core game until the local prototype already works.

---

## Client structure

Minimal structure:

```text
src/
  main.ts
  app/
    bootstrap.ts
    config.ts
  game/
    scenes/
      BootScene.ts
      GameScene.ts
    core/
      board.ts
      piece.ts
      rules.ts
      rotation.ts
      scoring.ts
      gameState.ts
    input/
      keyboard.ts
      touch.ts
    ui/
      hud.ts
      overlays.ts
  telegram/
    miniApp.ts
```

### Responsibility split

#### `app/`
Application bootstrap and Phaser game creation.

#### `game/core/`
Pure gameplay logic:
- board state
- active piece state
- collision checks
- rotation rules
- line clear detection
- score updates
- game over detection

This layer should stay as framework-agnostic as possible.

#### `game/scenes/`
Phaser scenes that connect rendering, input, and core logic.

#### `game/input/`
Keyboard and touch input adapters.

#### `game/ui/`
Small HUD and overlays only.
No heavy UI system in first iteration.

#### `telegram/`
Telegram Mini App glue code only.
This should not contain gameplay rules.

---

## Is backend needed on first stage?
No.

For the first playable prototype, **backend is not needed**.

Reason:
- the first question is whether the controls, pacing, and board feel are good
- backend does not help prove that
- backend would slow down iteration and increase integration/debug time

Backend should be introduced only if Iteration 3 truly needs persistent best score beyond local storage.

---

## Where score is stored in the first iteration

### Iteration 1
- Current run score lives **in memory only**
- Best score can be skipped entirely at first, or stored in **localStorage** if trivial

### Iteration 2
- Same approach remains valid
- Telegram integration should not force backend storage

### Iteration 3, only if needed
- Best score may be persisted in **localStorage** first
- Backend persistence is still optional and should only appear if there is a clear product reason

Decision: **first storage choice is localStorage, not backend**.

---

## Separation of concerns

### 1. Telegram bot entry
Purpose:
- give the player a way to open the Mini App from Telegram

Responsibilities:
- expose launch button/link
- no gameplay logic
- no score logic
- no stateful game simulation

This is just an entry point.

### 2. Mini App shell
Purpose:
- host the web app inside Telegram
- handle Telegram-specific environment setup

Responsibilities:
- init Telegram SDK
- read Telegram context if needed
- manage viewport expansion/readiness
- optionally handle pause/resume related app lifecycle events
- no board rules, no scoring rules

This is a platform wrapper.

### 3. Game logic
Purpose:
- run the actual playable prototype

Responsibilities:
- board model
- falling pieces
- movement/rotation
- line clear
- game over
- restart
- score

This must remain independent from Telegram-specific code as much as possible.

---

## Runtime flow

### Iteration 1
- Open app in browser locally
- Boot Phaser
- Start game scene
- Play, lose, restart

### Iteration 2
- Open through Telegram Mini App
- Mini App shell initializes platform context
- Start same Phaser game scene
- Play, pause/resume if needed, lose, restart

The same core game should run in both cases.

---

## Dependencies: needed now vs not needed now

### Needed now
- `phaser`
- `typescript`
- `vite`

### Needed in Iteration 2
- `@telegram-apps/sdk` or equivalent Telegram Mini Apps SDK package actually chosen for the integration

### Not needed now
- React
- Tailwind CSS
- Zustand/Redux
- Node backend
- PostgreSQL
- Prisma
- Sentry
- analytics SDK
- leaderboard services
- authentication stack beyond Telegram shell basics

---

## Technical principles
- Keep core gameplay deterministic and simple.
- Keep game rules outside Telegram integration code.
- Prefer one game scene plus minimal overlays over a complex scene tree.
- Prefer simple rotation implementation over high-fidelity competitive rules.
- Prefer local-only persistence before any networked storage.
- Avoid architecture for future scale before the prototype proves fun.

---

## Final recommendation
The first version should be a **small Phaser app with isolated game logic and zero backend**.

Telegram should be treated as a wrapper added in Iteration 2, not as the center of the architecture.

That is the fastest and safest way to prove the core actually works.
