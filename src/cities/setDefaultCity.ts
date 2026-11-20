import type { Config } from "../settings/types.ts";
import { pickCity } from "../cli/input.ts";
import { printError, printSuccess } from "../cli/output.ts";
import { saveConfig } from "../settings/storage.ts";
import { cityLabel } from "./label.ts";

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
