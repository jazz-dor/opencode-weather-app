import { join } from "node:path";
import type { City, Unit } from "../cities/types.ts";
import type { Config } from "./types.ts";
import { isValidCity } from "../cities/storage.ts";
import { CONFIG_FILENAME } from "../shared/constants.ts";

function configPath(): string {
  return join(process.cwd(), CONFIG_FILENAME);
}

function defaultConfig(): Config {
  return { cities: [], defaultCity: null, unit: "celsius" };
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) {
    return defaultConfig();
  }

  try {
    const raw = (await file.json()) as Partial<Config>;
    const cities = Array.isArray(raw.cities)
      ? raw.cities.filter(isValidCity)
      : [];
    const unit: Unit = raw.unit === "fahrenheit" ? "fahrenheit" : "celsius";
    const defaultCity =
      typeof raw.defaultCity === "string" &&
      cities.some((c) => c.name === raw.defaultCity)
        ? raw.defaultCity
        : null;
    return { cities, defaultCity, unit };
  } catch {
    return defaultConfig();
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(configPath(), JSON.stringify(config, null, 2) + "\n");
}

export interface SettingsPatch {
  defaultCity?: string | null;
  unit?: Unit;
}

export async function saveSettings(patch: SettingsPatch): Promise<void> {
  const current = await loadConfig();
  const next: Config = {
    cities: current.cities,
    defaultCity:
      patch.defaultCity !== undefined ? patch.defaultCity : current.defaultCity,
    unit: patch.unit !== undefined ? patch.unit : current.unit,
  };
  await saveConfig(next);
}

export type { City, Unit };
