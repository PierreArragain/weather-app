import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { CurrentWeatherResponse } from './dtos/weather.dto';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentLocationWeatherOverview', () => {
    it('should fetch and map current weather data', async () => {
      const lat = '35';
      const lon = '139';
      const locale = 'en';
      const mockResponse: CurrentWeatherResponse = {
        coord: {
          lon: -1.8799,
          lat: 50.7202,
        },
        weather: [
          {
            id: 501,
            main: 'Rain',
            description: 'pluie modérée',
            icon: '10n',
          },
          {
            id: 701,
            main: 'Mist',
            description: 'brume',
            icon: '50n',
          },
        ],
        base: 'stations',
        main: {
          temp: 14.01,
          feels_like: 13.97,
          temp_min: 12.71,
          temp_max: 14.67,
          pressure: 997,
          humidity: 96,
          sea_level: 997,
          grnd_level: 995,
        },
        visibility: 4000,
        wind: {
          speed: 9.77,
          deg: 210,
          gust: 14.92,
        },
        rain: {
          '1h': 0.55,
        },
        clouds: {
          all: 75,
        },
        dt: 1732387880,
        sys: {
          type: 2,
          id: 2008851,
          country: 'GB',
          sunrise: 1732347380,
          sunset: 1732378324,
        },
        timezone: 0,
        id: 3333129,
        name: 'Bournemouth',
        cod: 200,
      };

      jest
        .spyOn(service, 'fetchCurrentWeather')
        .mockResolvedValue(mockResponse);

      const result = await service.getCurrentLocationWeatherOverview(
        lat,
        lon,
        locale,
      );

      expect(result).toEqual({
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
      });
    });
  });

  describe('fetchCurrentWeather', () => {
    it('should fetch current weather data from API', async () => {
      const lat = '35';
      const lon = '139';
      const locale = 'en';
      const mockResponse = {
        coord: {
          lon: -1.8799,
          lat: 50.7202,
        },
        weather: [
          {
            id: 501,
            main: 'Rain',
            description: 'pluie modérée',
            icon: '10n',
          },
          {
            id: 701,
            main: 'Mist',
            description: 'brume',
            icon: '50n',
          },
        ],
        base: 'stations',
        main: {
          temp: 14.01,
          feels_like: 13.97,
          temp_min: 12.71,
          temp_max: 14.67,
          pressure: 997,
          humidity: 96,
          sea_level: 997,
          grnd_level: 995,
        },
        visibility: 4000,
        wind: {
          speed: 9.77,
          deg: 210,
          gust: 14.92,
        },
        rain: {
          '1h': 0.55,
        },
        clouds: {
          all: 75,
        },
        dt: 1732387880,
        sys: {
          type: 2,
          id: 2008851,
          country: 'GB',
          sunrise: 1732347380,
          sunset: 1732378324,
        },
        timezone: 0,
        id: 3333129,
        name: 'Bournemouth',
        cod: 200,
      };

      const axiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.fetchCurrentWeather(lat, lon, locale);

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if fetching weather data fails', async () => {
      const lat = '35';
      const lon = '139';
      const locale = 'en';

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(new Error('Error fetching weather data')));

      await expect(
        service.fetchCurrentWeather(lat, lon, locale),
      ).rejects.toThrow('Error fetching weather data');
    });
  });

  describe('mapCurrentWeather', () => {
    it('should map API response to CurrentWeatherDto', () => {
      const mockResponse: CurrentWeatherResponse = {
        coord: {
          lon: -1.8799,
          lat: 50.7202,
        },
        weather: [
          {
            id: 501,
            main: 'Rain',
            description: 'pluie modérée',
            icon: '10n',
          },
          {
            id: 701,
            main: 'Mist',
            description: 'brume',
            icon: '50n',
          },
        ],
        base: 'stations',
        main: {
          temp: 14.01,
          feels_like: 13.97,
          temp_min: 12.71,
          temp_max: 14.67,
          pressure: 997,
          humidity: 96,
          sea_level: 997,
          grnd_level: 995,
        },
        visibility: 4000,
        wind: {
          speed: 9.77,
          deg: 210,
          gust: 14.92,
        },
        rain: {
          '1h': 0.55,
        },
        clouds: {
          all: 75,
        },
        dt: 1732387880,
        sys: {
          type: 2,
          id: 2008851,
          country: 'GB',
          sunrise: 1732347380,
          sunset: 1732378324,
        },
        timezone: 0,
        id: 3333129,
        name: 'Bournemouth',
        cod: 200,
      };

      const result = service.mapCurrentWeather(mockResponse);

      expect(result).toEqual({
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
      });
    });
  });
});
