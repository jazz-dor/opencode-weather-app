import { stdout } from "node:process";
import type { Config } from "../types/Config.ts";
import { printBlank, printError } from "../presentation/output.ts";
import { showDailyForecastForCity } from "./showDailyForecastForCity.ts";

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
