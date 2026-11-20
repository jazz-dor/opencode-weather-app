import type { Config } from "../settings/types.ts";
import { pickCity } from "../cli/input.ts";
import { printError, printSuccess } from "../cli/output.ts";
import { saveConfig } from "../settings/storage.ts";
import { cityLabel } from "./label.ts";

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
