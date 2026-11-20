import { stdout } from "node:process";
import type { City, Unit } from "../types/City.ts";
import { fetchCurrentWeather } from "../api/weather.ts";
import { red } from "../utils/colors.ts";
import { cityLabel, formatWeather } from "../utils/format.ts";

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
