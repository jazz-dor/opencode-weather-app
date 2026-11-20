import { stdin, stdout } from "node:process";
import type { Unit } from "./api.ts";
import { blue, red, white } from "./colors.ts";

export const WIDTH = 40;
export const LINE = "═".repeat(WIDTH);

class LineReader {
  private buffer = "";
  private lines: string[] = [];
  private waiters: Array<(line: string | null) => void> = [];
  private ended = false;

  constructor() {
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk: string) => {
      this.buffer += chunk;
      let nl = this.buffer.indexOf("\n");
      while (nl !== -1) {
        const line = this.buffer.slice(0, nl).replace(/\r$/, "");
        this.buffer = this.buffer.slice(nl + 1);
        this.push(line);
        nl = this.buffer.indexOf("\n");
      }
    });
    stdin.on("end", () => {
      this.ended = true;
      if (this.buffer.length > 0) {
        this.push(this.buffer.replace(/\r$/, ""));
        this.buffer = "";
      }
      this.push(null);
    });
    stdin.resume();
  }

  private push(line: string | null): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(line);
    } else {
      this.lines.push(line as string);
    }
  }

  async nextLine(): Promise<string | null> {
    const ready = this.lines.shift();
    if (ready !== undefined) {
      return ready;
    }
    if (this.ended) {
      return null;
    }
    return new Promise((resolve) => this.waiters.push(resolve));
  }
}

const reader = new LineReader();

export async function ask(prompt: string): Promise<string> {
  stdout.write(prompt);
  const line = await reader.nextLine();
  return (line ?? "").trim();
}

export function closeInput(): void {
  stdin.pause();
}

export function clearScreen(): void {
  stdout.write("\x1b[2J\x1b[0m");
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export interface MenuState {
  cityCount: number;
  defaultCity: string | null;
  unit: Unit;
  highlight?: string;
}

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

export function formatCityList(cities: string[]): string {
  return cities.map((label, i) => white(`  ${i + 1}. ${label}\n`)).join("");
}
