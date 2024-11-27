import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  CurrentTodayAndForecastsByDayDto,
  CurrentWeatherDto,
  CurrentWeatherResponse,
  ForecastByDayDto,
  ForecastWeatherDto,
  ForecastWeatherResponse,
  ForecastWeatherTimestamp,
  TodayAndComingDaysForecastDto,
  WeatherSummary,
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
  ): Promise<CurrentTodayAndForecastsByDayDto> {
    const currentWeather = await this.getCurrentLocationWeatherOverview(
      lat,
      lon,
      locale,
    );
    const { today, forecasts } = await this.getTodayAndComingDaysForecast(
      lat,
      lon,
      locale,
    );
    return {
      current: currentWeather,
      today,
      forecasts,
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

  async getTodayAndComingDaysForecast(
    lat: string,
    lon: string,
    locale: string,
  ): Promise<TodayAndComingDaysForecastDto> {
    const apiResponse = await this.fetchForecastWeather(lat, lon, locale);
    const today = this.getDailyWeatherForecast(
      new Date().getUTCDate(),
      apiResponse,
    );
    const comingDaysForecast =
      this.getDailyForecastListForComingDays(apiResponse);

    return {
      today,
      forecasts: comingDaysForecast,
    };
  }

  async getTwentyFourHourForecastWeather(
    lat: string,
    lon: string,
    day: number,
    locale: string,
  ): Promise<ForecastWeatherDto> {
    const apiResponse = await this.fetchForecastWeather(lat, lon, locale);
    return this.getDailyWeatherForecast(day, apiResponse);
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

  getDailyForecastListForComingDays(
    response: ForecastWeatherResponse,
  ): ForecastByDayDto[] {
    const daysForecast: ForecastByDayDto[] = [];
    const timezone = response.city.timezone;
    const forecastByDay: { [day: number]: ForecastWeatherTimestamp[] } = {};

    for (const timestamp of response.list) {
      const forecastDay = new Date(
        (timestamp.dt + timezone) * 1000,
      ).getUTCDate();
      if (!forecastByDay[forecastDay]) {
        forecastByDay[forecastDay] = [];
      }
      forecastByDay[forecastDay].push({
        UTCtime: timestamp.dt,
        localTime: new Date((timestamp.dt + timezone) * 1000),
        temperature: timestamp.main.temp,
        feelsLike: timestamp.main.feels_like,
        tempMin: timestamp.main.temp_min,
        tempMax: timestamp.main.temp_max,
        main: timestamp.weather[0].main,
        description: timestamp.weather[0].description,
        icon: timestamp.weather[0].icon,
        rain: timestamp.rain,
        wind: timestamp.wind,
      });
    }

    for (const day in forecastByDay) {
      const dayForecasts = forecastByDay[day];
      const daySummary = this.getDaySummaryWeather(dayForecasts);
      daysForecast.push({
        weekDay: new Date(dayForecasts[0].localTime).toLocaleDateString(
          'fr-FR',
          { weekday: 'long' },
        ),
        weatherSummary: daySummary,
        maxTemp: Math.max(...dayForecasts.map((forecast) => forecast.tempMax)),
        minTemp: Math.min(...dayForecasts.map((forecast) => forecast.tempMin)),
        timezone: timezone,
        numberDay: new Date(dayForecasts[0].localTime).getUTCDate(),
      });
    }

    return daysForecast;
  }

  getDailyWeatherForecast(day: number, forecast: ForecastWeatherResponse) {
    const timezone = forecast.city.timezone;

    const filteredList = forecast.list.filter((timestamp) => {
      const forecastDay = new Date(
        (timestamp.dt + timezone) * 1000,
      ).getUTCDate();
      return forecastDay === day;
    });

    return {
      timezone: timezone,
      cityName: forecast.city.name,
      timestamps: filteredList.map((forecast) => ({
        UTCtime: forecast.dt,
        localTime: new Date((forecast.dt + timezone) * 1000),
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

  getDaySummaryWeather(forecasts: ForecastWeatherTimestamp[]): WeatherSummary {
    if (forecasts.length === 0) {
      throw new Error('La liste des prévisions est vide.');
    }

    const mainFrequency: {
      [main: string]: { count: number; icon: string; description: string };
    } = {};

    for (const forecast of forecasts) {
      if (forecast.main) {
        if (!mainFrequency[forecast.main]) {
          mainFrequency[forecast.main] = {
            count: 0,
            icon: forecast.icon,
            description: forecast.description,
          };
        }
        mainFrequency[forecast.main].count++;
      }
    }

    let mostFrequentMain: string | null = null;
    let maxFrequency = 0;

    for (const main in mainFrequency) {
      if (mainFrequency[main].count > maxFrequency) {
        maxFrequency = mainFrequency[main].count;
        mostFrequentMain = main;
      }
    }

    if (mostFrequentMain) {
      const { icon, description } = mainFrequency[mostFrequentMain];
      return { main: mostFrequentMain, icon, description };
    }

    const noonTime = 12;
    let closestToNoon = forecasts[0];
    let closestHourDiff = Math.abs(
      closestToNoon.localTime.getHours() - noonTime,
    );

    for (const forecast of forecasts) {
      const currentHourDiff = Math.abs(
        forecast.localTime.getHours() - noonTime,
      );
      if (currentHourDiff < closestHourDiff) {
        closestToNoon = forecast;
        closestHourDiff = currentHourDiff;
      }
    }

    return {
      main: closestToNoon.main,
      icon: closestToNoon.icon,
      description: closestToNoon.description,
    };
  }
}
