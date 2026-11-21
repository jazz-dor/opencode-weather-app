import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { fetchCurrentWeather, fetchDailyForecast } from "../../src/weather/api.ts";
import { mockFetch, jsonResponse, lastRequest } from "../support/mock-fetch.ts";
import type { FetchStub } from "../support/mock-fetch.ts";
import {
  currentWeatherPayload,
  currentWeatherPayloadBare,
  dailyForecastPayload,
  makeCity,
} from "../support/fixtures.ts";

const city = makeCity();

describe("fetchCurrentWeather", () => {
  let stub: FetchStub;

  afterEach(() => {
    stub?.restore();
  });

  test("arma la URL con coordenadas, campos y unidad", async () => {
    stub = mockFetch(() => jsonResponse(currentWeatherPayload));
    await fetchCurrentWeather(city, "fahrenheit");

    const url = lastRequest(stub);
    expect(url.pathname).toBe("/v1/forecast");
    expect(url.searchParams.get("latitude")).toBe(String(city.latitude));
    expect(url.searchParams.get("longitude")).toBe(String(city.longitude));
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(url.searchParams.get("current")).toContain("temperature_2m");
    expect(url.searchParams.get("current")).toContain("weather_code");
  });

  test("mapea la respuesta y usa las unidades devueltas por la API", async () => {
    stub = mockFetch(() => jsonResponse(currentWeatherPayload));
    const weather = await fetchCurrentWeather(city, "celsius");

    expect(weather).toEqual({
      temperature: 12.5,
      apparentTemperature: 11.2,
      relativeHumidity: 63,
      windSpeed: 14.4,
      weatherCode: 3,
      unitLabel: "°C",
      apparentUnitLabel: "°C",
      windUnitLabel: "km/h",
    });
  });

  test("aplica fallbacks de unidad cuando la respuesta es mínima", async () => {
    stub = mockFetch(() => jsonResponse(currentWeatherPayloadBare));
    const weather = await fetchCurrentWeather(city, "fahrenheit");

    expect(weather.temperature).toBe(20);
    expect(weather.unitLabel).toBe("°F");
    expect(weather.apparentUnitLabel).toBe("°F");
    expect(weather.windUnitLabel).toBe("km/h");
    expect(weather.weatherCode).toBeUndefined();
  });

  test("lanza error con el estado cuando la respuesta no es ok", async () => {
    stub = mockFetch(() => jsonResponse({}, 500));
    await expect(fetchCurrentWeather(city, "celsius")).rejects.toThrow(
      "Forecast falló con estado 500",
    );
  });

  test("lanza error si falta temperature_2m", async () => {
    stub = mockFetch(() => jsonResponse({ current: {} }));
    await expect(fetchCurrentWeather(city, "celsius")).rejects.toThrow(
      "La respuesta no incluyó temperature_2m",
    );
  });
});

describe("fetchDailyForecast", () => {
  let stub: FetchStub;

  afterEach(() => {
    stub?.restore();
  });

  test("pide 7 días, zona horaria y unidad correcta", async () => {
    stub = mockFetch(() => jsonResponse(dailyForecastPayload));
    await fetchDailyForecast(city, "celsius");

    const url = lastRequest(stub);
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("timezone")).toBe("auto");
    expect(url.searchParams.get("temperature_unit")).toBe("celsius");
    expect(url.searchParams.get("daily")).toContain("temperature_2m_max");
    expect(url.searchParams.get("daily")).toContain(
      "precipitation_probability_max",
    );
  });

  test("mapea los días alineando los arreglos por índice", async () => {
    stub = mockFetch(() => jsonResponse(dailyForecastPayload));
    const forecast = await fetchDailyForecast(city, "celsius");

    expect(forecast.unitLabel).toBe("°C");
    expect(forecast.precipitationUnitLabel).toBe("%");
    expect(forecast.days).toHaveLength(2);
    expect(forecast.days[0]).toEqual({
      date: "2026-11-20",
      tempMax: 18.4,
      tempMin: 7.2,
      weatherCode: 3,
      precipitationProbability: 10,
    });
    expect(forecast.days[1]).toEqual({
      date: "2026-11-21",
      tempMax: 19.1,
      tempMin: 8.0,
      weatherCode: 61,
      precipitationProbability: 45,
    });
  });

  test("aplica unidad de respaldo si no vienen daily_units", async () => {
    stub = mockFetch(() =>
      jsonResponse({ daily: { time: ["2026-11-20"] } }),
    );
    const forecast = await fetchDailyForecast(city, "fahrenheit");

    expect(forecast.unitLabel).toBe("°F");
    expect(forecast.precipitationUnitLabel).toBe("%");
    expect(forecast.days[0]?.tempMax).toBeUndefined();
  });

  test("lanza error cuando la respuesta no es ok", async () => {
    stub = mockFetch(() => jsonResponse({}, 429));
    await expect(fetchDailyForecast(city, "celsius")).rejects.toThrow(
      "Forecast diario falló con estado 429",
    );
  });

  test("lanza error cuando no hay días", async () => {
    stub = mockFetch(() => jsonResponse({ daily: { time: [] } }));
    await expect(fetchDailyForecast(city, "celsius")).rejects.toThrow(
      "Forecast diario no devolvió días",
    );
  });
});
