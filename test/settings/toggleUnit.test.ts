import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { toggleUnit } from "../../src/settings/toggleUnit.ts";
import { loadConfig } from "../../src/settings/storage.ts";
import { withTempCwd } from "../support/temp-cwd.ts";
import type { TempCwd } from "../support/temp-cwd.ts";

describe("toggleUnit (integración)", () => {
  let tmp: TempCwd;

  beforeEach(async () => {
    tmp = await withTempCwd();
  });

  afterEach(async () => {
    await tmp.restore();
  });

  test("alterna celsius -> fahrenheit y lo persiste", async () => {
    const config = { cities: [], defaultCity: null, unit: "celsius" as const };
    await toggleUnit(config);

    expect(config.unit).toBe("fahrenheit");
    expect((await loadConfig()).unit).toBe("fahrenheit");
  });

  test("alterna fahrenheit -> celsius y lo persiste", async () => {
    const config = {
      cities: [],
      defaultCity: null,
      unit: "fahrenheit" as const,
    };
    await toggleUnit(config);

    expect(config.unit).toBe("celsius");
    expect((await loadConfig()).unit).toBe("celsius");
  });

  test("alternar dos veces vuelve al valor original", async () => {
    const config = { cities: [], defaultCity: null, unit: "celsius" as const };
    await toggleUnit(config);
    await toggleUnit(config);

    expect(config.unit).toBe("celsius");
    expect((await loadConfig()).unit).toBe("celsius");
  });
});
