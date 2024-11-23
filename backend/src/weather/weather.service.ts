import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CurrentWeatherDto, CurrentWeatherResponse } from './dtos/weather.dto';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.OPENWEATHERMAP_API_KEY;
  private readonly weatherApiUrl = process.env.OPENWEATHERMAP_WEATHER_API_URL;
  constructor(private readonly httpService: HttpService) {}

  async getCurrentLocationWeatherOverview(
    lat: string,
    lon: string,
    locale: string,
  ) {
    const apiResponse = await this.fetchCurrentWeather(lat, lon, locale);
    return this.mapCurrentWeather(apiResponse);
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
}
