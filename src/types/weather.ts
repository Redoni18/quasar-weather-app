export type UnitsSystem = 'metric' | 'imperial';

export interface LocationOption {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  label: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  clouds: number;
  visibility: number;
  description: string;
  condition: string;
  icon: string;
  sunrise: number;
  sunset: number;
  updatedAt: number;
}

export interface ForecastItem {
  timestamp: number;
  dateLabel: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitationChance: number;
}

export interface WeatherSnapshot {
  location: LocationOption;
  units: UnitsSystem;
  current: CurrentWeather;
  forecast: ForecastItem[];
}
