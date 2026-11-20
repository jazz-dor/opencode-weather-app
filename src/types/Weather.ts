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
