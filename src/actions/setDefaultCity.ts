import type { Config } from "../types/Config.ts";
import { pickCity } from "../presentation/input.ts";
import { printError, printSuccess } from "../presentation/output.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { cityLabel } from "../utils/format.ts";

export async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    printError("No hay ciudades guardadas.");
    return;
  }
  const target = await pickCity(
    config.cities,
    "\n  Número de ciudad default: ",
    cityLabel,
  );
  if (!target) {
    printError("Opción inválida.");
    return;
  }
  config.defaultCity = target.name;
  await saveConfig(config);
  printSuccess(`Ciudad default: ${target.name}`);
}
