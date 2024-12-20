export interface CurrentAndForecastWeatherDto {
  current: CurrentWeatherDto;
  forecast: ForecastWeatherDto;
}
export interface CurrentWeatherDto {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  rain?: Rain;
  wind: Wind;
  sunrise: number;
  sunset: number;
}

export interface ForecastWeatherDto {
  timezone: number;
  cityName: string;
  timestamps: ForecastWeatherTimestamp[];
}

export interface ForecastWeatherTimestamp {
  UTCtime: number;
  localTime: Date;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  main: string;
  description: string;
  icon: string;
  rain?: Rain;
  wind: Wind;
}

export interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

export interface Rain {
  [key: string]: number;
}

export interface WeatherSummary {
  main: string;
  description: string;
  icon: string;
}

export interface ForecastByDayDto {
  timezone: number;
  weekDay: string;
  numberDay: number;
  fullDate: string;
  minTemp: number;
  maxTemp: number;
  weatherSummary: WeatherSummary;
}

export interface TodayAndComingDaysForecastDto {
  today: ForecastWeatherDto;
  forecasts: ForecastByDayDto[];
}

export interface CurrentTodayAndForecastsByDayDto
  extends TodayAndComingDaysForecastDto {
  current: CurrentWeatherDto;
}
