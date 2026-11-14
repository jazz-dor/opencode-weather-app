import { join } from "node:path";
import type { City, Config, Unit } from "./api.ts";

const CONFIG_FILENAME = "weather-config.json";

function configPath(): string {
  return join(process.cwd(), CONFIG_FILENAME);
}

function defaultConfig(): Config {
  return { cities: [], defaultCity: null, unit: "celsius" };
}

function isValidCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c["name"] === "string" &&
    typeof c["latitude"] === "number" &&
    typeof c["longitude"] === "number"
  );
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) {
    return defaultConfig();
  }

  try {
    const raw = (await file.json()) as Partial<Config>;
    const cities = Array.isArray(raw.cities) ? raw.cities.filter(isValidCity) : [];
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
