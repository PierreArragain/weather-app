import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  CurrentAndForecastWeatherDto,
  CurrentWeatherDto,
  CurrentWeatherResponse,
  ForecastWeatherData,
  ForecastWeatherDto,
  ForecastWeatherResponse,
} from './dtos/weather.dto';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.OPENWEATHERMAP_API_KEY;
  private readonly weatherApiUrl = process.env.OPENWEATHERMAP_WEATHER_API_URL;
  constructor(private readonly httpService: HttpService) {}

  async getCurrentLocationWeatherOverview(
    lat: string,
    lon: string,
    locale: string,
  ): Promise<CurrentWeatherDto> {
    const apiResponse = await this.fetchCurrentWeather(lat, lon, locale);
    return this.mapCurrentWeather(apiResponse);
  }

  async getCurrentAndForecastWeather(
    lat: string,
    lon: string,
    locale: string,
  ): Promise<CurrentAndForecastWeatherDto> {
    const currentWeather = await this.getCurrentLocationWeatherOverview(
      lat,
      lon,
      locale,
    );
    const forecastWeather = await this.getForecastWeather(lat, lon, locale);
    return {
      current: currentWeather,
      forecast: forecastWeather,
    };
  }

  async fetchCurrentWeather(
    lat: string,
    lon: string,
    locale: string,
  ): Promise<CurrentWeatherResponse> {
    const url = `${this.weatherApiUrl}weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${locale}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching weather data');
    }
  }

  async getForecastWeather(
    lat: string,
    lon: string,
    locale: string,
  ): Promise<ForecastWeatherDto> {
    const apiResponse = await this.fetchForecastWeather(lat, lon, locale);
    return this.mapForecastWeather(apiResponse);
  }

  async fetchForecastWeather(
    lat: string,
    lon: string,
    locale: string,
  ): Promise<ForecastWeatherResponse> {
    const url = `${this.weatherApiUrl}forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${locale}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching forecast data');
    }
  }

  mapCurrentWeather(response: CurrentWeatherResponse): CurrentWeatherDto {
    return {
      temperature: response.main.temp,
      feelsLike: response.main.feels_like,
      tempMin: response.main.temp_min,
      tempMax: response.main.temp_max,
      description: response.weather[0].description,
      icon: response.weather[0].icon,
      rain: response.rain,
      wind: response.wind,
      sunrise: response.sys.sunrise,
      sunset: response.sys.sunset,
    };
  }

  mapForecastWeather(response: ForecastWeatherResponse): ForecastWeatherDto {
    const filteredList = this.filterForecastListFourTimestampsADay(response);
    return {
      timezone: response.city.timezone,
      cityName: response.city.name,
      forecast: filteredList.map((forecast) => ({
        UTCtime: forecast.dt,
        localTime: new Date((forecast.dt + response.city.timezone) * 1000),
        temperature: forecast.main.temp,
        feelsLike: forecast.main.feels_like,
        tempMin: forecast.main.temp_min,
        tempMax: forecast.main.temp_max,
        main: forecast.weather[0].main,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        rain: forecast.rain,
        wind: forecast.wind,
      })),
    };
  }

  filterForecastListFourTimestampsADay(
    response: ForecastWeatherResponse,
  ): ForecastWeatherData[] {
    const firstDay = new Date(response.list[0].dt * 1000).getUTCDate();

    const secondDayForecasts = response.list.filter((forecast) => {
      const forecastDay = new Date(
        (forecast.dt + response.city.timezone) * 1000,
      ).getUTCDate();
      return forecastDay !== firstDay;
    });

    const firstRelevantForecast = secondDayForecasts.find((forecast) => {
      const localTime = new Date(
        (forecast.dt + response.city.timezone) * 1000,
      ).getHours();
      return localTime >= 6;
    });

    const firstHour = new Date(
      (firstRelevantForecast.dt + response.city.timezone) * 1000,
    ).getHours();

    const targetHours = [
      firstHour,
      (firstHour + 6) % 24,
      (firstHour + 12) % 24,
      (firstHour + 18) % 24,
    ];

    const filteredList = response.list.filter((forecast) => {
      const localTime = new Date((forecast.dt + response.city.timezone) * 1000);
      const hour = localTime.getHours();
      return targetHours.includes(hour);
    });

    return filteredList;
  }
}
