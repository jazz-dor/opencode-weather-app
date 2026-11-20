import { join } from "node:path";
import type { Config } from "../types/Config.ts";
import type { Unit } from "../types/City.ts";
import { CONFIG_FILENAME } from "../utils/constants.ts";
import { isValidCity } from "./citiesStorage.ts";

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

export async function loadDefaultCity(): Promise<string | null> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) return null;
  try {
    const raw = (await file.json()) as Partial<Config>;
    return typeof raw.defaultCity === "string" ? raw.defaultCity : null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: {
  defaultCity?: string | null;
  unit?: Unit;
}): Promise<void> {
  const file = Bun.file(configPath());
  let raw: Partial<Config> = {};
  if (await file.exists()) {
    try {
      raw = (await file.json()) as Partial<Config>;
    } catch {
      raw = {};
    }
  }
  if (settings.defaultCity !== undefined) {
    raw.defaultCity = settings.defaultCity;
  }
  if (settings.unit !== undefined) {
    raw.unit = settings.unit;
  }
  await Bun.write(configPath(), JSON.stringify(raw, null, 2) + "\n");
}

export async function saveUnit(unit: Unit): Promise<void> {
  await saveSettings({ unit });
}
