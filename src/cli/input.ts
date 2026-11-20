import { stdin, stdout } from "node:process";
import type { City } from "../cities/types.ts";
import { formatCityList } from "./output.ts";

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

export async function pickCity(
  cities: City[],
  prompt: string,
  label: (city: City) => string,
): Promise<City | null> {
  stdout.write(formatCityList(cities.map(label)));
  const idxRaw = await ask(prompt);
  const idx = Number.parseInt(idxRaw, 10) - 1;
  return cities[idx] ?? null;
}
