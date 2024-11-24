import { Test, TestingModule } from '@nestjs/testing';
import { CurrentWeatherDto, WeatherQueryDto } from './dtos/weather.dto';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getCurrentLocationWeatherOverview: jest.fn(),
            getCurrentAndForecastWeather: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    it('should call getCurrentLocationWeatherOverview with correct parameters', async () => {
      const weatherQueryDto: WeatherQueryDto = {
        lat: '40.7128',
        lon: '-74.0060',
        locale: 'fr',
      };
      const result: CurrentWeatherDto = {
        temperature: 12.14,
        feelsLike: 11.42,
        tempMin: 12.1,
        tempMax: 12.17,
        description: 'couvert',
        icon: '04n',
        wind: {
          speed: 10.6,
          deg: 191,
          gust: 21.43,
        },
        sunrise: 1732346310,
        sunset: 1732378724,
      };
      jest
        .spyOn(weatherService, 'getCurrentLocationWeatherOverview')
        .mockResolvedValue(result);

      expect(await controller.getCurrentWeather(weatherQueryDto)).toBe(result);
      expect(
        weatherService.getCurrentLocationWeatherOverview,
      ).toHaveBeenCalledWith(
        weatherQueryDto.lat,
        weatherQueryDto.lon,
        weatherQueryDto.locale,
      );
    });
  });
  describe('getForecastWeather', () => {
    it('should call getCurrentAndForecastWeather with correct parameters', async () => {
      const weatherQueryDto: WeatherQueryDto = {
        lat: '50.7202',
        lon: '-1.8799',
        locale: 'fr',
      };
      const result = {
        current: {
          temperature: 14.01,
          feelsLike: 13.97,
          tempMin: 12.71,
          tempMax: 14.67,
          description: 'pluie modérée',
          icon: '10n',
          rain: {
            '1h': 0.55,
          },
          wind: {
            speed: 9.77,
            deg: 210,
            gust: 14.92,
          },
          sunrise: 1732347380,
          sunset: 1732378324,
        },
        forecast: {
          timezone: 0,
          forecast: [
            {
              UTCtime: 1732387880,
              temperature: 14.01,
              feelsLike: 13.97,
              tempMin: 12.71,
              tempMax: 14.67,
              main: 'Rain',
              description: 'pluie modérée',
              icon: '10n',
              rain: {
                '3h': 0.55,
              },
              wind: {
                speed: 9.77,
                deg: 210,
                gust: 14.92,
              },
            },
          ],
        },
      };
      jest
        .spyOn(weatherService, 'getCurrentAndForecastWeather')
        .mockResolvedValue(result);

      expect(
        await controller.getCurrentAndForecastWeather(weatherQueryDto),
      ).toBe(result);
      expect(weatherService.getCurrentAndForecastWeather).toHaveBeenCalledWith(
        weatherQueryDto.lat,
        weatherQueryDto.lon,
        weatherQueryDto.locale,
      );
    });
  });
});
