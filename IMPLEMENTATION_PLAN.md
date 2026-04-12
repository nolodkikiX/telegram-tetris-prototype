# IMPLEMENTATION_PLAN

## Planning rule
Always prefer the smallest working version over the more complete version.

The goal is not to build the full product.
The goal is to prove that the core falling-block gameplay works and feels good.

---

## Iteration 1
## Local playable prototype

### Goal
Create a browser-playable local prototype with the complete core loop.

### Scope
- game board
- falling pieces
- left/right movement
- rotation
- soft drop
- hard drop if cheap
- line clear
- game over
- restart
- basic HUD with current score

### Deliverable
A local build that can be opened in browser and played repeatedly without Telegram integration.

### Tasks
1. Set up Vite + TypeScript + Phaser project
2. Create basic boot/app entry
3. Implement board model
4. Implement tetromino definitions and spawn logic
5. Implement gravity tick
6. Implement movement and collision checks
7. Implement rotation
8. Implement lock piece logic
9. Implement full line clear logic
10. Implement score updates
11. Implement game over detection
12. Implement restart flow
13. Add minimal HUD for score and game over state
14. Add basic mobile touch controls
15. Test gameplay loop locally and tune responsiveness

### Done when
- a full run can be played locally from start to game over
- restart works without page refresh
- line clear logic is correct
- controls feel responsive enough to judge the game honestly
- there are no major board corruption bugs

### Notes
- If hard drop slows progress, it can be added at the end of Iteration 1.
- If visual polish conflicts with input quality, cut visual polish.

---

## Iteration 2
## Telegram Mini App integration

### Goal
Wrap the playable prototype in Telegram Mini App with minimal platform-specific work.

### Scope
- launch from Telegram
- Mini App shell/integration
- mobile viewport adaptation
- pause/resume only if actually needed

### Deliverable
The same playable game launches and works inside Telegram Mini App on mobile.

### Tasks
1. Add Telegram Mini App SDK
2. Create Telegram shell bootstrap layer
3. Initialize Mini App correctly on launch
4. Ensure viewport/layout works inside Telegram container
5. Verify touch controls remain usable inside Telegram
6. Handle pause/resume or visibility changes only if game state can break without it
7. Test restart and game over flow inside Telegram

### Done when
- the game launches from Telegram reliably
- the board and HUD remain readable on mobile Telegram viewport
- controls still feel good inside Telegram
- app lifecycle events do not obviously break gameplay

### Notes
- Do not change core game rules during integration unless Telegram reveals a real usability issue.
- Telegram integration is successful only if the same local gameplay feel is preserved.

---

## Iteration 3
## Only if needed

### Goal
Add only the cheapest improvements that materially help the prototype.

### Scope
- persistence of best score
- minimal polish
- only cheap improvements

### Deliverable
A slightly more stable and replay-friendly build without meaningful scope growth.

### Tasks
1. Add best score persistence via localStorage
2. Show best score in menu or game over screen
3. Add minimal pause handling if still missing
4. Add one or two cheap feedback improvements, such as:
   - line clear flash
   - cleaner game over overlay
   - sound toggle only if audio exists
5. Fix the highest-value usability bugs found in testing

### Done when
- best score survives app reopen
- small polish improvements do not add complexity to core systems
- no new system is introduced just for polish

### Notes
- No leaderboard
- No analytics
- No daily challenge
- No social hooks
- No backend unless a concrete blocker appears

---

## What not to do before playable core is proven
- do not add leaderboard
- do not add analytics
- do not add daily challenge
- do not add social hooks
- do not add backend infrastructure early
- do not add heavy UI framework unless the prototype clearly needs it
- do not spend time on visual theming before controls and rules feel right

---

## Decision rule during implementation
If there is a choice between:
- prettier vs faster
- more complete vs easier to test
- more scalable vs simpler right now

choose:
- faster
- easier to test
- simpler right now

until the playable core is proven.

---

## Recommended execution order across all iterations
1. Make it playable locally
2. Make it playable inside Telegram
3. Add the smallest persistence/polish layer only if useful

That sequence keeps the project honest and reduces wasted work.
