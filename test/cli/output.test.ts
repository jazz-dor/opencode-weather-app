import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { stdout } from "node:process";
import {
  clearScreen,
  formatCityList,
  printBlank,
  printError,
  printLine,
  printSuccess,
  unitSymbol,
} from "../../src/cli/output.ts";

function captureStdout(): { write: (chunk: string) => boolean } {
  return stdout as unknown as { write: (chunk: string) => boolean };
}

describe("unitSymbol", () => {
  test("devuelve °C para celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  test("devuelve °F para fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("formatCityList", () => {
  test("numera las etiquetas desde 1 con sangría", () => {
    const result = formatCityList(["Madrid", "Ottawa"]);
    expect(result).toContain("1. Madrid");
    expect(result).toContain("2. Ottawa");
  });

  test("devuelve cadena vacía para lista vacía", () => {
    expect(formatCityList([])).toBe("");
  });
});

describe("salida por stdout", () => {
  let chunks: string[];
  let original: (chunk: string) => boolean;

  beforeEach(() => {
    chunks = [];
    original = captureStdout().write;
    captureStdout().write = (chunk: string) => {
      chunks.push(chunk);
      return true;
    };
  });

  afterEach(() => {
    captureStdout().write = original;
  });

  test("clearScreen escribe la secuencia ANSI", () => {
    clearScreen();
    expect(chunks.join("")).toBe("\x1b[2J\x1b[0m");
  });

  test("printSuccess incluye el mensaje", () => {
    printSuccess("Agregada");
    expect(chunks.join("")).toContain("Agregada");
  });

  test("printError incluye el mensaje", () => {
    printError("Falló");
    expect(chunks.join("")).toContain("Falló");
  });

  test("printLine escribe un salto de línea previo y el mensaje", () => {
    printLine("Hola");
    expect(chunks.join("")).toBe("\nHola");
  });

  test("printBlank escribe solo un salto de línea", () => {
    printBlank();
    expect(chunks.join("")).toBe("\n");
  });
});
