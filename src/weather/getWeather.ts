import { stdout } from "node:process";
import type { Config } from "../settings/types.ts";
import type { City, Unit } from "../cities/types.ts";
import { fetchCurrentWeather } from "./api.ts";
import { red } from "../shared/colors.ts";
import { cityLabel } from "../cities/label.ts";
import { formatWeather } from "./format.ts";

export async function getWeatherForCity(city: City, unit: Unit): Promise<void> {
  try {
    const weather = await fetchCurrentWeather(city, unit);
    stdout.write(`  ${cityLabel(city)}\n`);
    stdout.write(formatWeather(weather));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    stdout.write(red(`  Error obteniendo clima de ${city.name}: ${msg}\n`));
  }
}

export async function getWeather(config: Config): Promise<void> {
  const name = config.defaultCity;
  if (!name) {
    stdout.write(red("\n  No hay ciudad default. Usa la opción 5.\n"));
    return;
  }

  const city = config.cities.find((c) => c.name === name);
  if (!city) {
    stdout.write(red("\n  Ciudad default no encontrada.\n"));
    return;
  }

  await getWeatherForCity(city, config.unit);
}
