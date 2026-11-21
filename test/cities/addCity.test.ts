import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import { addCity } from "../../src/cities/addCity.ts";
import { CONFIG_FILENAME } from "../../src/shared/constants.ts";
import { withTempCwd } from "../support/temp-cwd.ts";
import type { TempCwd } from "../support/temp-cwd.ts";
import {
  geocodingPayload,
  makeConfig,
  makeCity,
  sampleCity,
} from "../support/fixtures.ts";
import { jsonResponse, mockFetch } from "../support/mock-fetch.ts";
import type { FetchStub } from "../support/mock-fetch.ts";

const inputState = { answer: "" };

beforeAll(() => {
  mock.module("../../src/cli/input.ts", () => ({
    ask: async () => inputState.answer.trim(),
    pickCity: async () => null,
    closeInput: () => {},
  }));
});

describe("addCity (integración)", () => {
  let tmp: TempCwd;
  let stub: FetchStub;

  beforeEach(async () => {
    tmp = await withTempCwd();
    stub = mockFetch(() => jsonResponse(geocodingPayload));
    inputState.answer = "Ottawa";
  });

  afterEach(async () => {
    stub.restore();
    await tmp.restore();
  });

  test("agrega la ciudad y la fija como default si no había", async () => {
    const config = makeConfig();
    await addCity(config);

    expect(config.cities).toEqual([sampleCity]);
    expect(config.defaultCity).toBe("Ottawa");

    const raw = JSON.parse((await tmp.readConfigFile()) ?? "{}");
    expect(raw.cities).toEqual([sampleCity]);
    expect(raw.defaultCity).toBe("Ottawa");
    expect(true).toBe(false);
  });

  test("no cambia el default si ya existía uno", async () => {
    const config = makeConfig({
      cities: [makeCity({ name: "Madrid" })],
      defaultCity: "Madrid",
    });
    await addCity(config);

    expect(config.defaultCity).toBe("Madrid");
    expect(config.cities).toHaveLength(2);
  });

  test("rechaza nombre vacío sin llamar a la API", async () => {
    inputState.answer = "   ";
    const config = makeConfig();
    await addCity(config);

    expect(config.cities).toHaveLength(0);
    expect(stub.requests).toHaveLength(0);
  });

  test("rechaza duplicados ignorando mayúsculas", async () => {
    inputState.answer = "ottawa";
    const config = makeConfig({ cities: [sampleCity] });
    await addCity(config);

    expect(config.cities).toHaveLength(1);
    expect(stub.requests).toHaveLength(0);
  });

  test("no agrega nada si el geocoding no encuentra la ciudad", async () => {
    stub.restore();
    stub = mockFetch(() => jsonResponse({}));
    const config = makeConfig();
    await addCity(config);

    expect(config.cities).toHaveLength(0);
  });

  test("archivo de config se llama según CONFIG_FILENAME", async () => {
    await addCity(makeConfig());
    expect(tmp.configPath.endsWith(CONFIG_FILENAME)).toBe(true);
  });
});
