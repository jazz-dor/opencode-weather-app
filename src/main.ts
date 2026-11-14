import { stdout } from "node:process";
import { fetchCurrentWeather, geocodeCity } from "./api.ts";
import type { City, Unit } from "./api.ts";
import { green, red } from "./colors.ts";
import { loadConfig, saveConfig } from "./config.ts";
import {
  ask,
  closeInput,
  formatCityList,
  printMenu,
  unitSymbol,
} from "./ui.ts";
import { cityLabel, formatWeather } from "./weather.ts";

async function waitEnter(): Promise<void> {
  await ask("\n  Presiona Enter para continuar...");
}

async function printWeather(city: City, unit: Unit): Promise<void> {
  try {
    const weather = await fetchCurrentWeather(city, unit);
    stdout.write(`  ${cityLabel(city)}\n`);
    stdout.write(formatWeather(weather));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    stdout.write(red(`  Error obteniendo clima de ${city.name}: ${msg}\n`));
  }
}

async function pickCity(cities: City[], prompt: string): Promise<City | null> {
  stdout.write(formatCityList(cities.map(cityLabel)));
  const idxRaw = await ask(prompt);
  const idx = Number.parseInt(idxRaw, 10) - 1;
  return cities[idx] ?? null;
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
    stdout.write("\n");

    try {
      switch (choice) {
        case "1": {
          if (!config.defaultCity) {
            stdout.write(red("\n  No hay ciudad default. Usa la opción 5.\n"));
            break;
          }
          const city = config.cities.find((c) => c.name === config.defaultCity);
          if (!city) {
            stdout.write(red("\n  Ciudad default no encontrada.\n"));
            break;
          }
          stdout.write("\n");
          await printWeather(city, config.unit);
          break;
        }

        case "2": {
          if (config.cities.length === 0) {
            stdout.write(red("\n  No hay ciudades guardadas.\n"));
            break;
          }
          stdout.write("\n");
          for (const city of config.cities) {
            await printWeather(city, config.unit);
            stdout.write("\n");
          }
          break;
        }

        case "3": {
          const query = await ask("\n  Nombre de la ciudad: ");
          if (!query) {
            stdout.write(red("\n  Nombre vacío.\n"));
            break;
          }
          if (
            config.cities.some(
              (c) => c.name.toLowerCase() === query.toLowerCase(),
            )
          ) {
            stdout.write(red("\n  Esa ciudad ya está guardada.\n"));
            break;
          }
          const found = await geocodeCity(query);
          if (!found) {
            stdout.write(red("\n  Ciudad no encontrada.\n"));
            break;
          }
          config.cities.push(found);
          if (!config.defaultCity) {
            config.defaultCity = found.name;
          }
          await saveConfig(config);
          stdout.write(green(`\n  Agregada: ${cityLabel(found)}\n`));
          break;
        }

        case "4": {
          if (config.cities.length === 0) {
            stdout.write(red("\n  No hay ciudades que eliminar.\n"));
            break;
          }
          const target = await pickCity(
            config.cities,
            "\n  Número a eliminar: ",
          );
          if (!target) {
            stdout.write(red("\n  Opción inválida.\n"));
            break;
          }
          const idx = config.cities.indexOf(target);
          config.cities.splice(idx, 1);
          if (config.defaultCity === target.name) {
            config.defaultCity = config.cities[0]?.name ?? null;
          }
          await saveConfig(config);
          stdout.write(green(`\n  Eliminada: ${target.name}\n`));
          break;
        }

        case "5": {
          if (config.cities.length === 0) {
            stdout.write(red("\n  No hay ciudades guardadas.\n"));
            break;
          }
          const target = await pickCity(
            config.cities,
            "\n  Número de ciudad default: ",
          );
          if (!target) {
            stdout.write(red("\n  Opción inválida.\n"));
            break;
          }
          config.defaultCity = target.name;
          await saveConfig(config);
          stdout.write(green(`\n  Ciudad default: ${target.name}\n`));
          break;
        }

        case "8": {
          config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
          await saveConfig(config);
          stdout.write(green(`\n  Unidad: ${unitSymbol(config.unit)}\n`));
          break;
        }

        case "9": {
          closeInput();
          stdout.write(green("\n  ¡Hasta luego!\n"));
          return;
        }

        default: {
          stdout.write(red("\n  Opción no válida.\n"));
          break;
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      stdout.write(red(`\n  Error: ${msg}\n`));
      await saveConfig(config);
    }

    await waitEnter();
  }
}
