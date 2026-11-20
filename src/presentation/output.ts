import { stdout } from "node:process";
import type { Unit } from "../types/City.ts";
import { green, red, white } from "../utils/colors.ts";

export function clearScreen(): void {
  stdout.write("\x1b[2J\x1b[0m");
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCityList(cities: string[]): string {
  return cities.map((label, i) => white(`  ${i + 1}. ${label}\n`)).join("");
}

export function printSuccess(message: string): void {
  stdout.write(green(`\n  ${message}\n`));
}

export function printError(message: string): void {
  stdout.write(red(`\n  ${message}\n`));
}

export function printLine(message: string): void {
  stdout.write(`\n${message}`);
}

export function printBlank(): void {
  stdout.write("\n");
}
