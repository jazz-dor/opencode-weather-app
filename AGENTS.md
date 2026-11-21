# AGENTS.md

**Asteroids** — HTML5 canvas arcade clone, vanilla JS, no framework/bundler/deps. The actual app is `index.html` + `game.js`. Everything under `src/` and `test/` is a **stale Weather CLI** from a previous project that still lives in the repo (tests pass, but the CLI is not wired to anything runnable).

## What's live vs. stale

- **Live (Asteroids):** `index.html`, `game.js`, `favicon.svg/favicon.svg`, `README.md`.
- **Stale (Weather CLI):** `src/**` (Bun + TS), `test/**`, `references/file-system.md`, `ideas-revision.md`, `bun-instructions.md`, root `tsconfig.json`, `package.json` scripts, `.github/workflows/release.yml`. Do not assume these describe the game.
- `package.json` is still named `02-weather`; its `main`/`module` points at `index.ts` which **does not exist**. `bun run start`/`bun run build` fail.
- When asked to change the game, edit `game.js`/`index.html`. Don't "fix" the weather CLI unless the task is about it.

## Running the game

- Open `index.html` in a browser (double-click works), or serve the folder. No build step.
- Canvas is fixed **800×600** (`index.html`); `game.js` hardcodes `W=800`, `H=600` — keep them in sync if you change the size.
- Space is toroidal: everything wraps via `wrap()` (`game.js:27`); new entities must use it.

## `game.js` structure (single file, top-to-bottom)

Input (`keys`/`justPressed`/`pressed`) → utils → classes `Bullet`, `Asteroid`, `Ship`, `Particle` → game state (`state = 'playing' | 'dead' | 'gameover'`) → `update(dt)` → `draw()`/HUD → `requestAnimationFrame` loop. Timestep is clamped to `0.05s` (`game.js:415`). Asteroid size constants `RADII`/`SPEEDS`/`POINTS` are indexed by size `1,2,3` with index `0` as a dummy (`game.js:61`). No tests cover `game.js`.

## Weather CLI (only if the task targets it)

- Runtime is **Bun** (`bun install`, `bun test`); never `node`/`npm`/`yarn`/`dotenv`. Entry is `src/index.ts` (root `index.ts` referenced by scripts is absent).
- Tests: `bun test` → 85 passing across 13 files. Support helpers in `test/support/` (`mockFetch`, `withTempCwd`, fixtures). Config file is `weather-config.json` in **`process.cwd()`** (`src/settings/storage.ts:8`) — not next to the executable; `withTempCwd` relies on that.
- `bun check` (the `typecheck` path) is **broken here**: `@types/bun` installs as a stub (only `package.json`, no `index.d.ts`), so tsc errors `Cannot find type definition file for 'bun'`. This is an install/OneDrive issue — don't edit `tsconfig.json` to work around it.
- Legacy layer folders (`src/actions`, `src/presentation`, `src/storage`, `src/types`, `src/api`, `src/utils`) and flat files (`src/main.ts`, `src/api.ts`, `src/config.ts`, `src/ui.ts`, `src/weather.ts`, `src/colors.ts`) are unused; the live feature code is `src/{cities,weather,settings,cli,shared}`.

## Conventions

- UI text and `README.md` are Spanish — match it.
- `.ts` extension required in relative imports (`allowImportingTsExtensions`); type-only imports use `import type`.
- Commit messages in the history are generic (`Guardar todos los cambios`); don't infer a strict format from them.
