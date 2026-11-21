import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { isValidCity, loadCities, saveCities } from "../../src/cities/storage.ts";
import type { City } from "../../src/cities/types.ts";
import { withTempCwd } from "../support/temp-cwd.ts";
import type { TempCwd } from "../support/temp-cwd.ts";
import { makeCity, sampleCity, secondCity } from "../support/fixtures.ts";

describe("isValidCity", () => {
  test("acepta una ciudad completa", () => {
    expect(isValidCity(sampleCity)).toBe(true);
  });

  test("acepta una ciudad con solo nombre y coordenadas", () => {
    expect(isValidCity({ name: "Quito", latitude: -0.18, longitude: -78.5 })).toBe(true);
  });

  test("rechaza null y no-objetos", () => {
    expect(isValidCity(null)).toBe(false);
    expect(isValidCity("Ottawa")).toBe(false);
    expect(isValidCity(42)).toBe(false);
    expect(isValidCity(undefined)).toBe(false);
  });

  test("rechaza si faltan campos obligatorios o tienen tipo incorrecto", () => {
    expect(isValidCity({ latitude: 1, longitude: 2 })).toBe(false);
    expect(isValidCity({ name: "X", latitude: "1", longitude: 2 })).toBe(false);
    expect(isValidCity({ name: "X", latitude: 1 })).toBe(false);
  });
});

describe("cities/storage", () => {
  let tmp: TempCwd;

  beforeEach(async () => {
    tmp = await withTempCwd();
  });

  afterEach(async () => {
    await tmp.restore();
  });

  test("loadCities devuelve [] si el archivo no existe", async () => {
    expect(await loadCities()).toEqual([]);
  });

  test("loadCities devuelve [] si el JSON está corrupto", async () => {
    await tmp.writeConfigFile("{ no es json");
    expect(await loadCities()).toEqual([]);
  });

  test("loadCities filtra entradas inválidas", async () => {
    await tmp.writeConfigFile(
      JSON.stringify({ cities: [sampleCity, { name: "Rota" }, null] }),
    );
    const cities = await loadCities();
    expect(cities).toEqual([sampleCity]);
  });

  test("loadCities devuelve [] si 'cities' no es arreglo", async () => {
    await tmp.writeConfigFile(JSON.stringify({ cities: "Ottawa" }));
    expect(await loadCities()).toEqual([]);
  });

  test("saveCities persiste y conserva otras claves del archivo", async () => {
    await tmp.writeConfigFile(JSON.stringify({ unit: "fahrenheit", extra: 1 }));

    const cities: City[] = [sampleCity, secondCity];
    await saveCities(cities);

    const raw = JSON.parse((await tmp.readConfigFile()) ?? "{}");
    expect(raw.cities).toEqual(cities);
    expect(raw.unit).toBe("fahrenheit");
    expect(raw.extra).toBe(1);
  });

  test("saveCities y loadCities hacen round-trip", async () => {
    const cities = [makeCity(), secondCity];
    await saveCities(cities);
    expect(await loadCities()).toEqual(cities);
  });
});
