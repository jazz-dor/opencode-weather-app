import type { City } from "../types/City.ts";
import type { CurrentWeather, DailyForecast } from "../types/Weather.ts";
import { cyan, red, white, yellow } from "./colors.ts";

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia helada ligera",
  67: "Lluvia helada fuerte",
  71: "Nevada ligera",
  73: "Nevada moderada",
  75: "Nevada fuerte",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  97: "Tormenta fuerte",
  99: "Tormenta con granizo fuerte",
};

export function describeWeatherCode(code: number | undefined): string {
  if (code === undefined) return "Sin datos";
  return WMO_DESCRIPTIONS[code] ?? "Condición desconocida";
}

export function cityLabel(city: City): string {
  const parts = [city.admin1, city.country].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  return parts.length > 0 ? `${city.name} (${parts.join(", ")})` : city.name;
}

const COLD_BELOW_C = 10;
const HOT_ABOVE_C = 25;

function toCelsius(value: number, unitLabel: string): number {
  return unitLabel.includes("F") ? ((value - 32) * 5) / 9 : value;
}

function colorTemperature(
  value: number,
  unitLabel: string,
  text: string,
): string {
  const celsius = toCelsius(value, unitLabel);
  if (celsius < COLD_BELOW_C) return cyan(text);
  if (celsius > HOT_ABOVE_C) return red(text);
  return yellow(text);
}

export function formatWeather(weather: CurrentWeather): string {
  const tempText = `${weather.temperature} ${weather.unitLabel}`;
  const lines = [
    `${white("  Temperatura:  ")}${colorTemperature(weather.temperature, weather.unitLabel, tempText)}`,
    `${white("  Condición:    ")}${white(describeWeatherCode(weather.weatherCode))}`,
  ];

  if (weather.apparentTemperature !== undefined) {
    const apparentText = `${weather.apparentTemperature} ${weather.apparentUnitLabel}`;
    lines.push(
      `${white("  Sensación:    ")}${colorTemperature(weather.apparentTemperature, weather.apparentUnitLabel, apparentText)}`,
    );
  }
  if (weather.relativeHumidity !== undefined) {
    lines.push(`${white(`  Humedad:      ${weather.relativeHumidity}%`)}`);
  }
  if (weather.windSpeed !== undefined) {
    lines.push(
      `${white(`  Viento:       ${weather.windSpeed} ${weather.windUnitLabel}`)}`,
    );
  }

  return lines.map((line) => `${line}\n`).join("");
}

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat("es", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

function formatDayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return DAY_LABEL_FORMAT.format(parsed);
}

export function formatDailyForecast(forecast: DailyForecast): string {
  return forecast.days
    .map((day) => {
      const parts: string[] = [];
      if (day.tempMax !== undefined) {
        const maxText = `${day.tempMax} ${forecast.unitLabel}`;
        parts.push(
          `${white("Máx ")}${colorTemperature(day.tempMax, forecast.unitLabel, maxText)}`,
        );
      }
      if (day.tempMin !== undefined) {
        const minText = `${day.tempMin} ${forecast.unitLabel}`;
        parts.push(
          `${white("Mín ")}${colorTemperature(day.tempMin, forecast.unitLabel, minText)}`,
        );
      }
      parts.push(white(describeWeatherCode(day.weatherCode)));
      if (day.precipitationProbability !== undefined) {
        parts.push(
          white(
            `${day.precipitationProbability}${forecast.precipitationUnitLabel} lluvia`,
          ),
        );
      }
      return `  ${white(formatDayLabel(day.date))}  ${parts.join(" · ")}\n`;
    })
    .join("");
}
