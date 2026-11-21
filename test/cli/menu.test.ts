import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { stdout } from "node:process";
import { printMenu } from "../../src/cli/menu.ts";
import type { MenuState } from "../../src/cli/menu.ts";

function captureStdout(): { write: (chunk: string) => boolean } {
  return stdout as unknown as { write: (chunk: string) => boolean };
}

describe("printMenu", () => {
  let chunks: string[];
  let original: (chunk: string) => boolean;

  const baseState: MenuState = {
    cityCount: 2,
    defaultCity: "Madrid",
    unit: "celsius",
  };

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

  test("lista todas las opciones con su número", () => {
    printMenu(baseState);
    const out = chunks.join("");

    expect(out).toContain("1. Clima de ciudad default");
    expect(out).toContain("2. Clima de todas las ciudades (2)");
    expect(out).toContain("3. Buscar y agregar ciudad");
    expect(out).toContain("4. Eliminar ciudad");
    expect(out).toContain("5. Establecer ciudad default");
    expect(out).toContain("7. Pronóstico");
    expect(out).toContain("8. Ajustes (°C)");
    expect(out).toContain("9. Salir");
  });

  test("muestra la ciudad default cuando existe", () => {
    printMenu(baseState);
    expect(chunks.join("")).toContain("Default: Madrid");
  });

  test("oculta la línea de default cuando es null", () => {
    printMenu({ ...baseState, defaultCity: null });
    expect(chunks.join("")).not.toContain("Default:");
  });

  test("usa el símbolo °F en ajustes para fahrenheit", () => {
    printMenu({ ...baseState, unit: "fahrenheit" });
    expect(chunks.join("")).toContain("Ajustes (°F)");
  });
});
