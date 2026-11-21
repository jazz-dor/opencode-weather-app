import { describe, expect, test } from "bun:test";
import {
  CONFIG_FILENAME,
  FORECAST_URL,
  GEOCODE_URL,
  LINE,
  WIDTH,
} from "../../src/shared/constants.ts";

describe("shared/constants", () => {
  test("WIDTH es 40", () => {
    expect(WIDTH).toBe(40);
  });

  test("LINE se repite WIDTH veces", () => {
    expect(LINE).toHaveLength(WIDTH);
    expect(new Set(LINE).size).toBe(1);
  });

  test("apunta a la API de geocoding de OpenMeteo", () => {
    expect(GEOCODE_URL).toBe("https://geocoding-api.open-meteo.com/v1/search");
  });

  test("apunta a la API de forecast de OpenMeteo", () => {
    expect(FORECAST_URL).toBe("https://api.open-meteo.com/v1/forecast");
  });

  test("el archivo de configuración es weather-config.json", () => {
    expect(CONFIG_FILENAME).toBe("weather-config.json");
  });
});
