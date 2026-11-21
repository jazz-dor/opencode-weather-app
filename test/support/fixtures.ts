import type { City } from "../../src/cities/types.ts";
import type { Config } from "../../src/settings/types.ts";

export const sampleCity: City = {
  name: "Ottawa",
  country: "Canadá",
  admin1: "Ontario",
  latitude: 45.41117,
  longitude: -75.69812,
};

export const secondCity: City = {
  name: "Madrid",
  country: "España",
  admin1: "Comunidad de Madrid",
  latitude: 40.4168,
  longitude: -3.7038,
};

export function makeCity(overrides: Partial<City> = {}): City {
  return { ...sampleCity, ...overrides };
}

export function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    cities: [],
    defaultCity: null,
    unit: "celsius",
    ...overrides,
  };
}

export const currentWeatherPayload = {
  current: {
    temperature_2m: 12.5,
    apparent_temperature: 11.2,
    relative_humidity_2m: 63,
    wind_speed_10m: 14.4,
    weather_code: 3,
  },
  current_units: {
    temperature_2m: "°C",
    apparent_temperature: "°C",
    relative_humidity_2m: "%",
    wind_speed_10m: "km/h",
  },
};

export const currentWeatherPayloadBare = {
  current: {
    temperature_2m: 20,
  },
};

export const dailyForecastPayload = {
  daily: {
    time: ["2026-11-20", "2026-11-21"],
    temperature_2m_max: [18.4, 19.1],
    temperature_2m_min: [7.2, 8.0],
    weather_code: [3, 61],
    precipitation_probability_max: [10, 45],
  },
  daily_units: {
    temperature_2m_max: "°C",
    temperature_2m_min: "°C",
    precipitation_probability_max: "%",
  },
};

export const geocodingPayload = {
  results: [
    {
      name: "Ottawa",
      country: "Canadá",
      admin1: "Ontario",
      latitude: 45.41117,
      longitude: -75.69812,
    },
  ],
};
