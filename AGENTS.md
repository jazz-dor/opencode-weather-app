# AGENTS.md

Weather CLI in **Bun + TypeScript** (Spanish UI). Organized by feature (Screaming Architecture): each top-level folder under `src/` names a domain (`weather/`, `cities/`, `settings/`), plus `cli/` (console interaction) and `shared/` (cross-cutting utils).

## Layout

- `index.ts` (root) — thin entrypoint: `import { main } from "./src/index.ts"`.
- `src/index.ts` — main menu loop and dispatch to feature actions.
- `src/weather/` — `getWeather.ts`, `showDailyForecast.ts` (+ per-city helpers `getWeatherForCity`, `showDailyForecastForCity`), `api.ts` (`fetchCurrentWeather`, `fetchDailyForecast`), `format.ts` (`describeWeatherCode`, `formatWeather`, `formatDailyForecast`), `types.ts`.
- `src/cities/` — `addCity.ts`, `removeCity.ts`, `setDefaultCity.ts`, `listCities.ts`, `geocoding.ts` (`geocodeCity`), `storage.ts` (`loadCities`/`saveCities`, `isValidCity`), `label.ts` (`cityLabel`), `types.ts` (`City`, `Unit`).
- `src/settings/` — `toggleUnit.ts`, `storage.ts` (`loadConfig`/`saveConfig`/`saveSettings`), `types.ts` (`Config`).
- `src/cli/` — `menu.ts` (`printMenu`, `MenuState`), `input.ts` (`LineReader`, `ask`, `pickCity`, `closeInput`), `output.ts` (mensajes éxito/error, `clearScreen`, `formatCityList`, `unitSymbol`).
- `src/shared/` — `colors.ts`, `constants.ts` (`WIDTH`, `LINE`, URLs, `CONFIG_FILENAME`).
- Older layer-based folders (`src/actions/`, `src/presentation/`, `src/storage/`, `src/types/`, `src/api/`, `src/utils/`) and legacy flat files (`src/main.ts`, `src/api.ts`, `src/config.ts`, `src/ui.ts`, `src/weather.ts`, `src/colors.ts`) are **left intact** but unused by the current entrypoint.
- `bun-instructions.md` — generic Cursor/Bun rules; mostly irrelevant here (frontend, `Bun.serve`, sqlite, HTML imports). Ignore unless the task needs it.

## Runtime: Bun, not Node

Use Bun for everything; never add `node`, `npm`, `pnpm`, `yarn`, `ts-node`, or `dotenv`. Imports of `node:*` builtins are fine.

- Run: `bun run index.ts`
- Install: `bun install`
- Compile a standalone binary: `bun build --compile index.ts --outfile weather` (produces `weather.exe` on Windows)
- bun auto-loads `.env` — no dotenv loader.

## Commands / verification gotchas

- There is **no test suite** (`bun test` finds 0 files) and **no build script**. Don't expect `bun run build`; it does not exist.
- `package.json` `typecheck` script is `bun check`. **In this environment it currently fails**: `@types/bun` and `typescript` install as empty stub dirs under `node_modules` (OneDrive path), so `bun check` / `bunx tsc --noEmit` error with `Cannot find type definition file for 'bun'`. This is an environment/install issue, not a code bug — don't "fix" it by editing tsconfig. Verify changes by running the app; if typecheck is needed, a clean checkout outside OneDrive usually resolves the stubs.
- Manual smoke test: `echo "9" | bun run index.ts` prints the menu and exits via "Salir".

## Config persistence (differs from what you might guess)

- Single file `weather-config.json`, written **next to the running executable** (`dirname(process.execPath)`), **not** under `~/.config` and not `data.json`.
- Shape: `{ cities: City[], defaultCity: string|null, unit: "celsius"|"fahrenheit" }`. It is user data (may not exist yet) — do **not** commit it; it is not currently in `.gitignore`, so add it before committing if generated.

## TypeScript constraints (tsconfig)

- `.ts` extension required in relative imports (`allowImportingTsExtensions` + `verbatimModuleSyntax`); type-only imports must use `import type`.
- Strict + `noUncheckedIndexedAccess` + `noImplicitOverride`; `types: ["bun"]` (do not add `@types/node`). `noEmit: true`.

## API flow (OpenMeteo, no key)

1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m&temperature_unit=<unit>`

Errors throw `Error` with Spanish messages; the menu catches them per-iteration.

## Conventions

- User-facing strings and `README.md` are in Spanish — match that.
- Menu has intentionally non-contiguous options (1–5, then 8 Ajustes, 9 Salir).
