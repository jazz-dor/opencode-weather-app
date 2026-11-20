import { join } from "node:path";
import type { City } from "./types.ts";
import { CONFIG_FILENAME } from "../shared/constants.ts";

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

interface RawConfig {
  cities?: unknown;
  [key: string]: unknown;
}

async function readRaw(): Promise<RawConfig> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) return {};
  try {
    return (await file.json()) as RawConfig;
  } catch {
    return {};
  }
}

export async function loadCities(): Promise<City[]> {
  const raw = await readRaw();
  return Array.isArray(raw.cities) ? raw.cities.filter(isValidCity) : [];
}

export async function saveCities(cities: City[]): Promise<void> {
  const raw = await readRaw();
  raw.cities = cities;
  await Bun.write(configPath(), JSON.stringify(raw, null, 2) + "\n");
}
