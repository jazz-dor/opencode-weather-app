import type { Config } from "../types/Config.ts";
import { geocodeCity } from "../api/geocoding.ts";
import { ask } from "../presentation/input.ts";
import { printError, printSuccess } from "../presentation/output.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { cityLabel } from "../utils/format.ts";

export async function addCity(config: Config): Promise<void> {
  const query = await ask("\n  Nombre de la ciudad: ");
  if (!query) {
    printError("Nombre vacío.");
    return;
  }
  if (
    config.cities.some((c) => c.name.toLowerCase() === query.toLowerCase())
  ) {
    printError("Esa ciudad ya está guardada.");
    return;
  }
  const found = await geocodeCity(query);
  if (!found) {
    printError("Ciudad no encontrada.");
    return;
  }
  config.cities.push(found);
  if (!config.defaultCity) {
    config.defaultCity = found.name;
  }
  await saveConfig(config);
  printSuccess(`Agregada: ${cityLabel(found)}`);
}
