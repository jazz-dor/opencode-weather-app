import { stdout } from "node:process";
import { addCity } from "./cities/addCity.ts";
import { listCities } from "./cities/listCities.ts";
import { removeCity } from "./cities/removeCity.ts";
import { setDefaultCity } from "./cities/setDefaultCity.ts";
import { getWeather } from "./weather/getWeather.ts";
import { showDailyForecast } from "./weather/showDailyForecast.ts";
import { toggleUnit } from "./settings/toggleUnit.ts";
import { ask, closeInput } from "./cli/input.ts";
import { printMenu } from "./cli/menu.ts";
import { printBlank, printError } from "./cli/output.ts";
import { loadConfig, saveConfig } from "./settings/storage.ts";
import { green, red } from "./shared/colors.ts";

async function waitEnter(): Promise<void> {
  await ask("\n  Presiona Enter para continuar...");
}

export async function main(): Promise<void> {
  let config = await loadConfig();

  while (true) {
    printMenu({
      cityCount: config.cities.length,
      defaultCity: config.defaultCity,
      unit: config.unit,
    });

    if (config.cities.length === 0) {
      stdout.write(red("\n  No hay ciudades guardadas. Usa la opción 3.\n"));
    }

    const choice = await ask("\n  Selecciona una opción: ");

    printMenu({
      cityCount: config.cities.length,
      defaultCity: config.defaultCity,
      unit: config.unit,
      highlight: choice,
    });
    printBlank();

    try {
      switch (choice) {
        case "1": {
          if (!config.defaultCity) {
            printError("No hay ciudad default. Usa la opción 5.");
            break;
          }
          stdout.write("\n");
          await getWeather(config);
          break;
        }

        case "2": {
          stdout.write("\n");
          await listCities(config);
          break;
        }

        case "3": {
          await addCity(config);
          break;
        }

        case "4": {
          await removeCity(config);
          break;
        }

        case "5": {
          await setDefaultCity(config);
          break;
        }

        case "7": {
          await showDailyForecast(config);
          break;
        }

        case "8": {
          await toggleUnit(config);
          break;
        }

        case "9": {
          closeInput();
          stdout.write(green("\n  ¡Hasta luego!\n"));
          return;
        }

        default: {
          printError("Opción no válida.");
          break;
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      printError(`Error: ${msg}`);
      await saveConfig(config);
    }

    await waitEnter();
  }
}
