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
