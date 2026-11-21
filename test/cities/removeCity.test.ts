import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import { removeCity } from "../../src/cities/removeCity.ts";
import { withTempCwd } from "../support/temp-cwd.ts";
import type { TempCwd } from "../support/temp-cwd.ts";
import { makeCity, sampleCity, secondCity } from "../support/fixtures.ts";
import type { Config } from "../../src/settings/types.ts";
import type { City } from "../../src/cities/types.ts";

const pickState: { target: City | null } = { target: null };

beforeAll(() => {
  mock.module("../../src/cli/input.ts", () => ({
    ask: async () => "",
    pickCity: async () => pickState.target,
    closeInput: () => {},
  }));
});

describe("removeCity (integración)", () => {
  let tmp: TempCwd;

  beforeEach(async () => {
    tmp = await withTempCwd();
    pickState.target = null;
  });

  afterEach(async () => {
    await tmp.restore();
  });

  function persisted(): Promise<Config> {
    return Bun.file(tmp.configPath).json() as Promise<Config>;
  }

  test("elimina la ciudad seleccionada y persiste", async () => {
    const config: Config = {
      cities: [sampleCity, secondCity],
      defaultCity: "Ottawa",
      unit: "celsius",
    };
    pickState.target = secondCity;

    await removeCity(config);

    expect(config.cities).toEqual([sampleCity]);
    expect((await persisted()).cities).toEqual([sampleCity]);
  });

  test("reasigna el default al primer restante si se elimina el default", async () => {
    const config: Config = {
      cities: [sampleCity, secondCity],
      defaultCity: "Ottawa",
      unit: "celsius",
    };
    pickState.target = sampleCity;

    await removeCity(config);

    expect(config.defaultCity).toBe("Madrid");
    expect((await persisted()).defaultCity).toBe("Madrid");
  });

  test("deja default en null si no queda ninguna ciudad", async () => {
    const config: Config = {
      cities: [sampleCity],
      defaultCity: "Ottawa",
      unit: "celsius",
    };
    pickState.target = sampleCity;

    await removeCity(config);

    expect(config.cities).toHaveLength(0);
    expect(config.defaultCity).toBeNull();
    expect((await persisted()).defaultCity).toBeNull();
  });

  test("no toca storage si la lista está vacía", async () => {
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };
    await removeCity(config);
    expect(await tmp.readConfigFile()).toBeNull();
  });

  test("no elimina nada si pickCity devuelve null", async () => {
    const config: Config = {
      cities: [sampleCity, makeCity({ name: "Lima" })],
      defaultCity: "Ottawa",
      unit: "celsius",
    };
    pickState.target = null;

    await removeCity(config);

    expect(config.cities).toHaveLength(2);
    expect(await tmp.readConfigFile()).toBeNull();
  });
});
