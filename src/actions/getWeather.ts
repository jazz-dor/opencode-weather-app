import { stdout } from "node:process";
import type { Config } from "../types/Config.ts";
import { fetchCurrentWeather } from "../api/weather.ts";
import { red } from "../utils/colors.ts";
import { cityLabel, formatWeather } from "../utils/format.ts";

export async function getWeather(config: Config, cityName?: string): Promise<void> {
  const name = cityName ?? config.defaultCity;
  if (!name) {
    stdout.write(red("\n  No hay ciudad default. Usa la opción 5.\n"));
    return;
  }

  const city = config.cities.find((c) => c.name === name);
  if (!city) {
    stdout.write(red("\n  Ciudad default no encontrada.\n"));
    return;
  }

  try {
    const weather = await fetchCurrentWeather(city, config.unit);
    stdout.write(`  ${cityLabel(city)}\n`);
    stdout.write(formatWeather(weather));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    stdout.write(red(`  Error obteniendo clima de ${city.name}: ${msg}\n`));
  }
}
