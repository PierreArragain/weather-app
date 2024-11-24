import { Controller, Get, Query } from '@nestjs/common';
import { WeatherQueryDto } from './dtos/weather.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('/current')
  async getCurrentWeather(@Query() { lat, lon, locale }: WeatherQueryDto) {
    return this.weatherService.getCurrentLocationWeatherOverview(
      lat,
      lon,
      locale,
    );
  }

  @Get('/forecast')
  async getCurrentAndForecastWeather(
    @Query() { lat, lon, locale }: WeatherQueryDto,
  ) {
    return this.weatherService.getCurrentAndForecastWeather(lat, lon, locale);
  }
}
