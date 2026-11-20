import { stdout } from "node:process";
import type { MenuState } from "../types/MenuOption.ts";
import { blue, red, white } from "../utils/colors.ts";
import { LINE, WIDTH } from "../utils/constants.ts";
import { clearScreen, unitSymbol } from "./output.ts";

export function printMenu(state: MenuState): void {
  clearScreen();
  stdout.write(`${white(LINE)}\n`);
  stdout.write(
    `${white("WEATHER CLI".padStart((WIDTH + 11) / 2).padEnd(WIDTH))}\n`,
  );
  stdout.write(`${white(LINE)}\n`);

  const options: Array<[string, string]> = [
    ["1", "Clima de ciudad default"],
    ["2", `Clima de todas las ciudades (${state.cityCount})`],
    ["3", "Buscar y agregar ciudad"],
    ["4", "Eliminar ciudad"],
    ["5", "Establecer ciudad default"],
    ["7", "Pronóstico 7 días (todas)"],
    ["8", `Ajustes (${unitSymbol(state.unit)})`],
    ["9", "Salir"],
  ];

  for (const [key, label] of options) {
    const text = `  ${key}. ${label}`;
    const base = key === "9" ? red(text) : white(text);
    stdout.write(`${key === state.highlight ? blue(text) : base}\n`);
  }

  stdout.write(`${white(LINE)}\n`);
  if (state.defaultCity) {
    stdout.write(`${white(`  Default: ${state.defaultCity}`)}\n`);
  }
}
