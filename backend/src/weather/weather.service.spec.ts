import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import {
  CurrentWeatherResponse,
  ForecastWeatherResponse,
} from './dtos/weather.dto';
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
      const lat = '50.7202';
      const lon = '-1.8799';
      const locale = 'fr';
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
      const lat = '50.7202';
      const lon = '-1.8799';
      const locale = 'fr';
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
      const lat = '50.7202';
      const lon = '-1.8799';
      const locale = 'fr';

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(new Error('Error fetching weather data')));

      await expect(
        service.fetchCurrentWeather(lat, lon, locale),
      ).rejects.toThrow('Error fetching weather data');
    });
  });

  describe('fetchForecastWeather', () => {
    it('should fetch forecast weather data from API', async () => {
      const lat = '50.7202';
      const lon = '-1.8799';
      const locale = 'fr';
      const mockResponse: ForecastWeatherResponse = {
        cod: '200',
        message: 0,
        cnt: 40,
        list: [
          {
            dt: 1732387880,
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
            weather: [
              {
                id: 501,
                main: 'Rain',
                description: 'pluie modérée',
                icon: '10n',
              },
            ],
            clouds: {
              all: 75,
            },
            wind: {
              speed: 9.77,
              deg: 210,
              gust: 14.92,
            },
            visibility: 4000,

            rain: {
              '3h': 0.55,
            },
            sys: {
              pod: 'n',
            },
            dt_txt: '2023-10-23 18:00:00',
          },
        ],
        city: {
          id: 3333129,
          name: 'Bournemouth',
          coord: {
            lat: 50.7202,
            lon: -1.8799,
          },
          country: 'GB',
          population: 163600,
          timezone: 0,
          sunrise: 1732347380,
          sunset: 1732378324,
        },
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

      const result = await service.fetchForecastWeather(lat, lon, locale);

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if fetching forecast data fails', async () => {
      const lat = '50.7202';
      const lon = '-1.8799';
      const locale = 'fr';

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(new Error('Error fetching forecast data')));

      await expect(
        service.fetchForecastWeather(lat, lon, locale),
      ).rejects.toThrow('Error fetching forecast data');
    });

    describe('getDailyForecastListForComingDays', () => {
      it('should group forecasts by day and map them correctly', () => {
        const mockResponse: ForecastWeatherResponse = {
          cod: '200',
          message: 0,
          cnt: 40,
          list: [
            {
              dt: 1732387880,
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
              weather: [
                {
                  id: 501,
                  main: 'Rain',
                  description: 'pluie modérée',
                  icon: '10n',
                },
              ],
              clouds: {
                all: 75,
              },
              wind: {
                speed: 9.77,
                deg: 210,
                gust: 14.92,
              },
              visibility: 4000,
              rain: {
                '3h': 0.55,
              },
              sys: {
                pod: 'n',
              },
              dt_txt: '2023-10-23 18:00:00',
            },
            {
              dt: 1732474280,
              main: {
                temp: 15.01,
                feels_like: 14.97,
                temp_min: 13.71,
                temp_max: 15.67,
                pressure: 998,
                humidity: 95,
                sea_level: 998,
                grnd_level: 996,
              },
              weather: [
                {
                  id: 502,
                  main: 'Clear',
                  description: 'ciel dégagé',
                  icon: '01d',
                },
              ],
              clouds: {
                all: 0,
              },
              wind: {
                speed: 5.77,
                deg: 180,
                gust: 10.92,
              },
              visibility: 10000,
              rain: null,
              sys: {
                pod: 'd',
              },
              dt_txt: '2023-10-24 18:00:00',
            },
          ],
          city: {
            id: 3333129,
            name: 'Bournemouth',
            coord: {
              lat: 50.7202,
              lon: -1.8799,
            },
            country: 'GB',
            population: 163600,
            timezone: 0,
            sunrise: 1732347380,
            sunset: 1732378324,
          },
        };

        const result = service.getDailyForecastListForComingDays(mockResponse);

        expect(result).toEqual([
          {
            weekDay: 'samedi',
            weatherSummary: {
              main: 'Rain',
              icon: '10n',
              description: 'pluie modérée',
            },
            maxTemp: 14.67,
            minTemp: 12.71,
            timezone: 0,
            numberDay: 23,
          },
          {
            weekDay: 'dimanche',
            weatherSummary: {
              main: 'Clear',
              icon: '01d',
              description: 'ciel dégagé',
            },
            maxTemp: 15.67,
            minTemp: 13.71,
            timezone: 0,
            numberDay: 24,
          },
        ]);
      });

      it('should handle empty forecast list', () => {
        const mockResponse: ForecastWeatherResponse = {
          cod: '200',
          message: 0,
          cnt: 0,
          list: [],
          city: {
            id: 3333129,
            name: 'Bournemouth',
            coord: {
              lat: 50.7202,
              lon: -1.8799,
            },
            country: 'GB',
            population: 163600,
            timezone: 0,
            sunrise: 1732347380,
            sunset: 1732378324,
          },
        };

        const result = service.getDailyForecastListForComingDays(mockResponse);

        expect(result).toEqual([]);
      });
    });
  });

  describe('getDailyForecastListForComingDays', () => {
    it('should group forecasts by day and map them correctly', () => {
      const mockResponse: ForecastWeatherResponse = {
        cod: '200',
        message: 0,
        cnt: 2,
        list: [
          {
            dt: 1732387880,
            main: {
              temp_max: 14.67,
              temp_min: 12.71,
              temp: 0,
              feels_like: 0,
              pressure: 0,
              sea_level: 0,
              grnd_level: 0,
              humidity: 0,
            },
            weather: [
              {
                description: 'pluie modérée',
                icon: '10n',
                main: 'Rain',
                id: 0,
              },
            ],
            wind: {
              speed: 9.77,
              deg: 210,
              gust: 14.92,
            },
            sys: undefined,
            dt_txt: '',
            clouds: undefined,
            visibility: 0,
            rain: undefined,
          },
          {
            dt: 1732474280,
            main: {
              temp_max: 15.67,
              temp_min: 13.71,
              temp: 0,
              feels_like: 0,
              pressure: 0,
              sea_level: 0,
              grnd_level: 0,
              humidity: 0,
            },
            weather: [
              {
                id: 502,
                description: 'ciel dégagé',
                icon: '01d',
                main: 'Clear',
              },
            ],
            wind: {
              speed: 10.77,
              deg: 220,
              gust: 15.92,
            },
            sys: undefined,
            dt_txt: '',
            clouds: undefined,
            visibility: 0,
            rain: undefined,
          },
        ],
        city: {
          id: 3333129,
          name: 'Bournemouth',
          coord: { lat: 50.7202, lon: -1.8799 },
          country: 'GB',
          population: 163600,
          timezone: 0,
          sunrise: 1732347380,
          sunset: 1732378324,
        },
      };

      const result = service.getDailyForecastListForComingDays(mockResponse);

      expect(result).toEqual([
        {
          maxTemp: 14.67,
          minTemp: 12.71,
          numberDay: 23,
          timezone: 0,
          weatherSummary: {
            description: 'pluie modérée',
            icon: '10n',
            main: 'Rain',
          },
          weekDay: 'samedi',
        },
        {
          maxTemp: 15.67,
          minTemp: 13.71,
          numberDay: 24,
          timezone: 0,
          weatherSummary: {
            description: 'ciel dégagé',
            icon: '01d',
            main: 'Clear',
          },
          weekDay: 'dimanche',
        },
      ]);
    });

    describe('mapCurrentWeather', () => {
      it('should map the API response to CurrentWeatherDto correctly', () => {
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

      describe('getCurrentAndForecastWeather', () => {
        it('should fetch current and forecast weather data', async () => {
          const lat = '50.7202';
          const lon = '-1.8799';
          const locale = 'fr';

          const mockCurrentWeather = {
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
          };

          const mockTodayAndForecasts = {
            today: {
              timezone: 0,
              cityName: 'Bournemouth',
              timestamps: [
                {
                  UTCtime: 1732387880,
                  localTime: new Date(1732387880 * 1000),
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
            forecasts: [
              {
                weekDay: 'samedi',
                weatherSummary: {
                  main: 'Rain',
                  icon: '10n',
                  description: 'pluie modérée',
                },
                maxTemp: 14.67,
                minTemp: 12.71,
                timezone: 0,
                numberDay: 23,
              },
              {
                weekDay: 'dimanche',
                weatherSummary: {
                  main: 'Clear',
                  icon: '01d',
                  description: 'ciel dégagé',
                },
                maxTemp: 15.67,
                minTemp: 13.71,
                timezone: 0,
                numberDay: 24,
              },
            ],
          };

          jest
            .spyOn(service, 'getCurrentLocationWeatherOverview')
            .mockResolvedValue(mockCurrentWeather);
          jest
            .spyOn(service, 'getTodayAndComingDaysForecast')
            .mockResolvedValue(mockTodayAndForecasts);

          const result = await service.getCurrentAndForecastWeather(
            lat,
            lon,
            locale,
          );

          expect(result).toEqual({
            current: mockCurrentWeather,
            today: mockTodayAndForecasts.today,
            forecasts: mockTodayAndForecasts.forecasts,
          });
        });

        it('should throw an error if fetching current weather data fails', async () => {
          const lat = '50.7202';
          const lon = '-1.8799';
          const locale = 'fr';

          jest
            .spyOn(service, 'getCurrentLocationWeatherOverview')
            .mockRejectedValue(
              new Error('Error fetching current weather data'),
            );

          await expect(
            service.getCurrentAndForecastWeather(lat, lon, locale),
          ).rejects.toThrow('Error fetching current weather data');
        });

        it('should throw an error if fetching forecast weather data fails', async () => {
          const lat = '50.7202';
          const lon = '-1.8799';
          const locale = 'fr';

          const mockCurrentWeather = {
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
          };

          jest
            .spyOn(service, 'getCurrentLocationWeatherOverview')
            .mockResolvedValue(mockCurrentWeather);
          jest
            .spyOn(service, 'getTodayAndComingDaysForecast')
            .mockRejectedValue(
              new Error('Error fetching forecast weather data'),
            );

          await expect(
            service.getCurrentAndForecastWeather(lat, lon, locale),
          ).rejects.toThrow('Error fetching forecast weather data');
        });
      });
    });
  });
});
