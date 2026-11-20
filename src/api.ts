export type Unit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface Config {
  cities: City[];
  defaultCity: string | null;
  unit: Unit;
}

interface GeocodingResult {
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  current_units?: {
    temperature_2m?: string;
    apparent_temperature?: string;
    relative_humidity_2m?: string;
    wind_speed_10m?: string;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
    precipitation_probability_max?: number[];
  };
  daily_units?: {
    temperature_2m_max?: string;
    temperature_2m_min?: string;
    precipitation_probability_max?: string;
  };
}

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function geocodeCity(name: string): Promise<City | null> {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding falló con estado ${res.status}`);
  }

  const data = (await res.json()) as GeocodingResponse;
  const hit = data.results?.[0];
  if (!hit || hit.latitude === undefined || hit.longitude === undefined) {
    return null;
  }

  return {
    name: hit.name ?? name,
    country: hit.country,
    admin1: hit.admin1,
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature?: number;
  relativeHumidity?: number;
  windSpeed?: number;
  weatherCode?: number;
  unitLabel: string;
  apparentUnitLabel: string;
  windUnitLabel: string;
}

export async function fetchCurrentWeather(
  city: City,
  unit: Unit,
): Promise<CurrentWeather> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
  );
  url.searchParams.set("temperature_unit", unit);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast falló con estado ${res.status}`);
  }

  const data = (await res.json()) as ForecastResponse;
  const temp = data.current?.temperature_2m;
  if (temp === undefined) {
    throw new Error("La respuesta no incluyó temperature_2m");
  }

  const fallbackTempUnit = unit === "celsius" ? "°C" : "°F";

  return {
    temperature: temp,
    apparentTemperature: data.current?.apparent_temperature,
    relativeHumidity: data.current?.relative_humidity_2m,
    windSpeed: data.current?.wind_speed_10m,
    weatherCode: data.current?.weather_code,
    unitLabel: data.current_units?.temperature_2m ?? fallbackTempUnit,
    apparentUnitLabel:
      data.current_units?.apparent_temperature ?? fallbackTempUnit,
    windUnitLabel: data.current_units?.wind_speed_10m ?? "km/h",
  };
}

export interface DailyForecastDay {
  date: string;
  tempMax?: number;
  tempMin?: number;
  weatherCode?: number;
  precipitationProbability?: number;
}

export interface DailyForecast {
  days: DailyForecastDay[];
  unitLabel: string;
  precipitationUnitLabel: string;
}

export async function fetchDailyForecast(
  city: City,
  unit: Unit,
): Promise<DailyForecast> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", unit);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Forecast diario falló con estado ${res.status}`);
  }

  const data = (await res.json()) as ForecastResponse;
  const times = data.daily?.time;
  if (!times || times.length === 0) {
    throw new Error("Forecast diario no devolvió días");
  }

  const fallbackTempUnit = unit === "celsius" ? "°C" : "°F";

  const days: DailyForecastDay[] = times.map((date, i) => ({
    date,
    tempMax: data.daily?.temperature_2m_max?.[i],
    tempMin: data.daily?.temperature_2m_min?.[i],
    weatherCode: data.daily?.weather_code?.[i],
    precipitationProbability:
      data.daily?.precipitation_probability_max?.[i],
  }));

  return {
    days,
    unitLabel: data.daily_units?.temperature_2m_max ?? fallbackTempUnit,
    precipitationUnitLabel:
      data.daily_units?.precipitation_probability_max ?? "%",
  };
}
