import { join } from "node:path";
import type { Config } from "../types/Config.ts";
import type { City, Unit } from "../types/City.ts";
import { CONFIG_FILENAME } from "../utils/constants.ts";

function configPath(): string {
  return join(process.cwd(), CONFIG_FILENAME);
}

export function isValidCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c["name"] === "string" &&
    typeof c["latitude"] === "number" &&
    typeof c["longitude"] === "number"
  );
}

export async function loadCities(): Promise<City[]> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) return [];
  try {
    const raw = (await file.json()) as Partial<Config>;
    return Array.isArray(raw.cities) ? raw.cities.filter(isValidCity) : [];
  } catch {
    return [];
  }
}

export async function saveCities(cities: City[]): Promise<void> {
  const file = Bun.file(configPath());
  let raw: Partial<Config> = {};
  if (await file.exists()) {
    try {
      raw = (await file.json()) as Partial<Config>;
    } catch {
      raw = {};
    }
  }
  raw.cities = cities;
  await Bun.write(configPath(), JSON.stringify(raw, null, 2) + "\n");
}

export async function loadUnit(): Promise<Unit> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) return "celsius";
  try {
    const raw = (await file.json()) as Partial<Config>;
    return raw.unit === "fahrenheit" ? "fahrenheit" : "celsius";
  } catch {
    return "celsius";
  }
}
