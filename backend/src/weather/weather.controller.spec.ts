import { Test, TestingModule } from '@nestjs/testing';
import {
  CurrentTodayAndForecastsByDayDto,
  CurrentWeatherDto,
  WeatherQueryDto,
} from './dtos/weather.dto';
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

    describe('getCurrentAndForecastWeather', () => {
      it('should call getCurrentAndForecastWeather with correct parameters', async () => {
        const weatherQueryDto: WeatherQueryDto = {
          lat: '40.7128',
          lon: '-74.0060',
          locale: 'fr',
        };
        const result: CurrentTodayAndForecastsByDayDto = {
          current: {
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
          },
          today: {
            timezone: 7200,
            cityName: 'New York',

            timestamps: [
              {
                UTCtime: 1732346310,
                localTime: new Date(1732346310 * 1000),
                temperature: 12.14,
                feelsLike: 11.42,
                tempMin: 12.1,
                tempMax: 12.17,
                main: 'Clouds',
                description: 'couvert',
                icon: '04n',
                wind: {
                  speed: 10.6,
                  deg: 191,
                  gust: 21.43,
                },
              },
            ],
          },
          forecasts: [
            {
              timezone: 7200,
              weekDay: 'Monday',
              numberDay: 1,
              fullDate: new Date(1732346310 * 1000),
              minTemp: 12.1,
              maxTemp: 12.17,
              weatherSummary: {
                main: 'Clouds',
                description: 'couvert',
                icon: '04n',
              },
            },
          ],
        };
        jest
          .spyOn(weatherService, 'getCurrentAndForecastWeather')
          .mockResolvedValue(result);

        expect(
          await controller.getCurrentAndForecastWeather(weatherQueryDto),
        ).toBe(result);
        expect(
          weatherService.getCurrentAndForecastWeather,
        ).toHaveBeenCalledWith(
          weatherQueryDto.lat,
          weatherQueryDto.lon,
          weatherQueryDto.locale,
        );
      });
    });
  });
});
