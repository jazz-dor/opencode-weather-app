import type { Config } from "../types/Config.ts";
import { pickCity } from "../presentation/input.ts";
import { printError, printSuccess } from "../presentation/output.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { cityLabel } from "../utils/format.ts";

export async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    printError("No hay ciudades que eliminar.");
    return;
  }
  const target = await pickCity(
    config.cities,
    "\n  Número a eliminar: ",
    cityLabel,
  );
  if (!target) {
    printError("Opción inválida.");
    return;
  }
  const idx = config.cities.indexOf(target);
  config.cities.splice(idx, 1);
  if (config.defaultCity === target.name) {
    config.defaultCity = config.cities[0]?.name ?? null;
  }
  await saveConfig(config);
  printSuccess(`Eliminada: ${target.name}`);
}
