import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import { setDefaultCity } from "../../src/cities/setDefaultCity.ts";
import { withTempCwd } from "../support/temp-cwd.ts";
import type { TempCwd } from "../support/temp-cwd.ts";
import { sampleCity, secondCity } from "../support/fixtures.ts";
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

describe("setDefaultCity (integración)", () => {
  let tmp: TempCwd;

  beforeEach(async () => {
    tmp = await withTempCwd();
    pickState.target = null;
  });

  afterEach(async () => {
    await tmp.restore();
  });

  test("fija y persiste la ciudad default seleccionada", async () => {
    const config: Config = {
      cities: [sampleCity, secondCity],
      defaultCity: "Ottawa",
      unit: "celsius",
    };
    pickState.target = secondCity;

    await setDefaultCity(config);

    expect(config.defaultCity).toBe("Madrid");
    const raw = (await Bun.file(tmp.configPath).json()) as Config;
    expect(raw.defaultCity).toBe("Madrid");
  });

  test("no toca nada si no hay ciudades", async () => {
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };
    await setDefaultCity(config);
    expect(await tmp.readConfigFile()).toBeNull();
  });

  test("no cambia el default si la selección es inválida", async () => {
    const config: Config = {
      cities: [sampleCity],
      defaultCity: "Ottawa",
      unit: "celsius",
    };
    pickState.target = null;

    await setDefaultCity(config);

    expect(config.defaultCity).toBe("Ottawa");
    expect(await tmp.readConfigFile()).toBeNull();
  });
});
