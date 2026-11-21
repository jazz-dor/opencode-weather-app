import { describe, expect, test } from "bun:test";

process.env.NO_COLOR = "1";

import {
  describeWeatherCode,
  formatDailyForecast,
  formatWeather,
} from "../../src/weather/format.ts";
import type { CurrentWeather, DailyForecast } from "../../src/weather/types.ts";

describe("describeWeatherCode", () => {
  test("traduce códigos WMO conocidos al español", () => {
    expect(describeWeatherCode(0)).toBe("Despejado");
    expect(describeWeatherCode(3)).toBe("Nublado");
    expect(describeWeatherCode(61)).toBe("Lluvia ligera");
    expect(describeWeatherCode(95)).toBe("Tormenta");
  });

  test("usa 'Sin datos' cuando el código es undefined", () => {
    expect(describeWeatherCode(undefined)).toBe("Sin datos");
  });

  test("usa 'Condición desconocida' para códigos fuera de la tabla", () => {
    expect(describeWeatherCode(999)).toBe("Condición desconocida");
  });
});

describe("formatWeather", () => {
  test("incluye temperatura y condición", () => {
    const weather: CurrentWeather = {
      temperature: 22,
      weatherCode: 0,
      unitLabel: "°C",
      apparentUnitLabel: "°C",
      windUnitLabel: "km/h",
    };
    const output = formatWeather(weather);
    expect(output).toContain("Temperatura:");
    expect(output).toContain("22 °C");
    expect(output).toContain("Condición:");
    expect(output).toContain("Despejado");
    expect(output).not.toContain("Sensación:");
    expect(output).not.toContain("Humedad:");
    expect(output).not.toContain("Viento:");
  });

  test("incluye sensación, humedad y viento cuando están presentes", () => {
    const weather: CurrentWeather = {
      temperature: 22,
      apparentTemperature: 21,
      relativeHumidity: 55,
      windSpeed: 9,
      weatherCode: 2,
      unitLabel: "°C",
      apparentUnitLabel: "°C",
      windUnitLabel: "km/h",
    };
    const output = formatWeather(weather);
    expect(output).toContain("Sensación:");
    expect(output).toContain("Humedad:");
    expect(output).toContain("55%");
    expect(output).toContain("Viento:");
    expect(output).toContain("9 km/h");
  });

  test("termina cada línea con salto de línea", () => {
    const weather: CurrentWeather = {
      temperature: 5,
      unitLabel: "°C",
      apparentUnitLabel: "°C",
      windUnitLabel: "km/h",
    };
    const output = formatWeather(weather);
    expect(output.endsWith("\n")).toBe(true);
    const lines = output.split("\n").filter((line) => line.length > 0);
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(line).toContain("Temperatura:");
      break;
    }
  });
});

describe("formatDailyForecast", () => {
  const forecast: DailyForecast = {
    days: [
      {
        date: "2026-11-20",
        tempMax: 18,
        tempMin: 7,
        weatherCode: 3,
        precipitationProbability: 10,
      },
      {
        date: "2026-11-21",
        tempMax: 19,
        tempMin: 8,
        weatherCode: 61,
        precipitationProbability: 45,
      },
    ],
    unitLabel: "°C",
    precipitationUnitLabel: "%",
  };

  test("renderiza una línea por día", () => {
    const output = formatDailyForecast(forecast);
    const lines = output.split("\n").filter((line) => line.length > 0);
    expect(lines).toHaveLength(2);
  });

  test("incluye máx, mín, condición y probabilidad de lluvia", () => {
    const output = formatDailyForecast(forecast);
    expect(output).toContain("Máx 18 °C");
    expect(output).toContain("Mín 7 °C");
    expect(output).toContain("Nublado");
    expect(output).toContain("10% lluvia");
    expect(output).toContain("Lluvia ligera");
    expect(output).toContain("45% lluvia");
  });

  test("omite partes ausentes sin romper", () => {
    const sparse: DailyForecast = {
      days: [{ date: "2026-11-20" }],
      unitLabel: "°C",
      precipitationUnitLabel: "%",
    };
    const output = formatDailyForecast(sparse);
    expect(output).not.toContain("Máx");
    expect(output).not.toContain("Mín");
    expect(output).toContain("Sin datos");
    expect(output).not.toContain("lluvia");
  });

  test("mantiene la fecha original si no es parseable", () => {
    const malformed: DailyForecast = {
      days: [{ date: "no-es-fecha" }],
      unitLabel: "°C",
      precipitationUnitLabel: "%",
    };
    expect(formatDailyForecast(malformed)).toContain("no-es-fecha");
  });
});
