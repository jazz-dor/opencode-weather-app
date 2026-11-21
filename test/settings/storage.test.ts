import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  loadConfig,
  saveConfig,
  saveSettings,
} from "../../src/settings/storage.ts";
import { withTempCwd } from "../support/temp-cwd.ts";
import type { TempCwd } from "../support/temp-cwd.ts";
import { makeCity, sampleCity, secondCity } from "../support/fixtures.ts";

describe("settings/storage", () => {
  let tmp: TempCwd;

  beforeEach(async () => {
    tmp = await withTempCwd();
  });

  afterEach(async () => {
    await tmp.restore();
  });

  test("loadConfig devuelve la configuración por defecto sin archivo", async () => {
    expect(await loadConfig()).toEqual({
      cities: [],
      defaultCity: null,
      unit: "celsius",
    });
  });

  test("loadConfig devuelve la configuración por defecto si el JSON es inválido", async () => {
    await tmp.writeConfigFile("{ roto");
    expect(await loadConfig()).toEqual({
      cities: [],
      defaultCity: null,
      unit: "celsius",
    });
  });

  test("loadConfig normaliza una unidad desconocida a celsius", async () => {
    await tmp.writeConfigFile(
      JSON.stringify({ cities: [], defaultCity: null, unit: "kelvin" }),
    );
    expect((await loadConfig()).unit).toBe("celsius");
  });

  test("loadConfig conserva fahrenheit", async () => {
    await tmp.writeConfigFile(
      JSON.stringify({ cities: [], defaultCity: null, unit: "fahrenheit" }),
    );
    expect((await loadConfig()).unit).toBe("fahrenheit");
  });

  test("loadConfig descarta defaultCity si no existe en las ciudades", async () => {
    await tmp.writeConfigFile(
      JSON.stringify({
        cities: [sampleCity],
        defaultCity: "Atlantida",
        unit: "celsius",
      }),
    );
    expect((await loadConfig()).defaultCity).toBeNull();
  });

  test("loadConfig acepta defaultCity que sí existe", async () => {
    await tmp.writeConfigFile(
      JSON.stringify({
        cities: [sampleCity],
        defaultCity: "Ottawa",
        unit: "celsius",
      }),
    );
    expect((await loadConfig()).defaultCity).toBe("Ottawa");
  });

  test("loadConfig filtra ciudades inválidas", async () => {
    await tmp.writeConfigFile(
      JSON.stringify({
        cities: [sampleCity, { name: "Mala" }, secondCity],
        defaultCity: null,
        unit: "celsius",
      }),
    );
    expect((await loadConfig()).cities).toEqual([sampleCity, secondCity]);
  });

  test("saveConfig escribe JSON con salto de línea final", async () => {
    await saveConfig({
      cities: [makeCity()],
      defaultCity: "Ottawa",
      unit: "fahrenheit",
    });
    const content = (await tmp.readConfigFile()) ?? "";
    expect(content.endsWith("\n")).toBe(true);
    expect(JSON.parse(content)).toEqual({
      cities: [sampleCity],
      defaultCity: "Ottawa",
      unit: "fahrenheit",
    });
  });

  test("saveSettings aplica solo las claves del patch", async () => {
    await saveConfig({
      cities: [sampleCity],
      defaultCity: "Ottawa",
      unit: "celsius",
    });

    await saveSettings({ unit: "fahrenheit" });
    let config = await loadConfig();
    expect(config.unit).toBe("fahrenheit");
    expect(config.defaultCity).toBe("Ottawa");
    expect(config.cities).toEqual([sampleCity]);

    await saveSettings({ defaultCity: null });
    config = await loadConfig();
    expect(config.defaultCity).toBeNull();
    expect(config.unit).toBe("fahrenheit");
  });
});
