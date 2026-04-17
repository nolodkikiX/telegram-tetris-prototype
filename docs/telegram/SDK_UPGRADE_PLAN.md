# Telegram SDK Upgrade Plan

## Context

Current integration is intentionally thin and isolated in `src/telegram/miniApp.ts`.
The project currently uses `@telegram-apps/sdk@3.11.8` and only relies on a small API surface:

- `isTMA`
- `init`
- `mountMiniAppSync`
- `mountViewport`
- `expandViewport`
- `miniAppReady`
- `retrieveLaunchParams`

Local verification on 2026-04-17:

- `npm view @telegram-apps/sdk version` returns `3.11.8`
- `npm audit --omit=dev` reports 4 high severity vulnerabilities in the dependency tree
- installed transitive packages `@telegram-apps/bridge`, `@telegram-apps/transformers`, and `@telegram-apps/types` emit deprecation warnings during install

## Why upgrade carefully

The runtime adapter is small, but it sits on the app bootstrap path. A rushed package swap would risk breaking:

- Telegram launch detection
- viewport mounting
- ready signaling
- launch parameter parsing for user-scoped persistence

The game itself should not know which Telegram package is behind the adapter.

## Target state

Keep Telegram integration behind one local adapter and move to a maintained SDK stack with the same outward behavior for the rest of the app.

Primary candidate:

- move from the current `@telegram-apps/sdk` adapter to an `@tma.js`-based adapter, because the Telegram Mini Apps organization currently points developers to `@tma.js`-based templates

Fallback candidate:

- replace the adapter with a minimal wrapper around Telegram's official JavaScript bridge if the package migration does not reduce dependency risk enough

## Migration sequence

1. Freeze the adapter contract.
   The only public contract should remain `bootstrapTelegramMiniApp(): Promise<TelegramShellState>`.

2. Keep launch parameter parsing local to the adapter.
   `user.id` extraction for storage scoping must stay in the Telegram layer and must not leak into game logic.

3. Create a branch that swaps only the Telegram adapter implementation.
   No gameplay or UI changes in the same branch.

4. Replace package usage inside `src/telegram/miniApp.ts`.
   Map the new package calls to the same outcomes:
   - detect Telegram runtime
   - initialize bridge
   - mount or sync the mini app shell
   - mount and expand viewport if available
   - signal readiness
   - read launch params and user id

5. Re-run audit and build checks.
   Success criteria:
   - `npm install` has no deprecation warnings from the replaced stack
   - `npm audit --omit=dev` does not report the current 4 high severity findings from this tree
   - `npm run build` passes

6. Smoke test both runtimes.
   - browser preview still falls back quietly
   - Telegram Mini App still sets the correct runtime label
   - saved stats stay user-scoped in Telegram

## Rollback rule

If the new package changes launch param shape or viewport behavior in a way that affects startup or persistence, revert only the adapter branch and keep the new storage scoping logic.

## Sources

- Telegram Mini Apps organization: <https://github.com/Telegram-Mini-Apps>
- Official Telegram Mini Apps JavaScript SDK repository: <https://github.com/TelegramMessenger/TGMiniAppsJsSDK>
