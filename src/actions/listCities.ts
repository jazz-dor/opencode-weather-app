import { stdout } from "node:process";
import type { Config } from "../types/Config.ts";
import { printBlank, printError } from "../presentation/output.ts";
import { getWeatherForCity } from "./getWeatherForCity.ts";

export async function listCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    printError("No hay ciudades guardadas.");
    return;
  }
  stdout.write("\n");
  for (const city of config.cities) {
    await getWeatherForCity(city, config.unit);
    printBlank();
  }
}
