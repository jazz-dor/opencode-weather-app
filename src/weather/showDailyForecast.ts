import { stdout } from "node:process";
import type { Config } from "../settings/types.ts";
import type { City, Unit } from "../cities/types.ts";
import { fetchDailyForecast } from "./api.ts";
import { red } from "../shared/colors.ts";
import { printBlank, printError } from "../cli/output.ts";
import { cityLabel } from "../cities/label.ts";
import { formatDailyForecast } from "./format.ts";

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

export async function showDailyForecast(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    printError("No hay ciudades guardadas.");
    return;
  }
  stdout.write("\n");
  for (const city of config.cities) {
    await showDailyForecastForCity(city, config.unit);
    printBlank();
  }
}
