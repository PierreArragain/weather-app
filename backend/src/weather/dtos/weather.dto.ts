export class WeatherQueryDto {
  lat: string;
  lon: string;
  locale: string;
}

export class CurrentWeatherDto {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  rain: Rain;
  wind: Wind;
  sunrise: number;
  sunset: number;
}

export interface ForecastWeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastWeatherData[];
  city: City;
}

export interface ForecastWeatherData extends FullWeatherData {
  sys: ForecastSys;
  dt_txt: string;
}

export interface CurrentWeatherResponse extends FullWeatherData {
  coord: Coord;
  base: string;
  timezone: number;
  id: number;
  name: string;
  cod: number;
  sys: CurrentSys;
}

export interface FullWeatherData {
  dt: number;
  main: MainWeatherData;
  weather: WeatherData[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain: Rain;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

export interface WeatherData {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Clouds {
  all: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

export interface Rain {
  [key: string]: number;
}

export interface CurrentSys {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface ForecastSys {
  pod: string;
}

export interface Coord {
  lon: number;
  lat: number;
}

export interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}
