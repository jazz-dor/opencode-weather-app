import { stdout } from "node:process";
import type { City, Unit } from "../types/City.ts";
import { fetchDailyForecast } from "../api/weather.ts";
import { red } from "../utils/colors.ts";
import { cityLabel, formatDailyForecast } from "../utils/format.ts";

export async function showDailyForecastForCity(
  city: City,
  unit: Unit,
): Promise<void> {
  try {
    const forecast = await fetchDailyForecast(city, unit);
    stdout.write(`  ${cityLabel(city)}\n`);
    stdout.write(formatDailyForecast(forecast));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    stdout.write(
      red(`  Error obteniendo pronóstico de ${city.name}: ${msg}\n`),
    );
  }
}
