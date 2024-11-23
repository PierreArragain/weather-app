import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { LocationApiResponse } from './dtos/location.dto';
import { LocationService } from './location.service';
describe('LocationService', () => {
  let service: LocationService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchLocations', () => {
    it('should return location suggestions', async () => {
      const mockResponse: LocationApiResponse = {
        data: [
          {
            display_name: 'Londres, Grand Londres, Angleterre, Royaume-Uni',
            name: 'Londres',
            lat: '51.5074456',
            lon: '-0.1277653',
            importance: 0.8820890292539882,
          },
          {
            display_name: 'London, Ontario, N6A 3N7, Canada',
            lat: '42.9832406',
            lon: '-81.243372',
            name: 'London',
            importance: 0.6078714571941068,
          },
        ],
      };
      jest.spyOn(service, 'fetchLocations').mockResolvedValue(mockResponse);

      const result = await service.searchLocations('query', 'fr');
      expect(result).toEqual([
        {
          name: 'Londres, Grand Londres, Angleterre, Royaume-Uni',
          latitude: '51.5074456',
          longitude: '-0.1277653',
          localName: 'Londres',
        },
        {
          name: 'London, Ontario, N6A 3N7, Canada',
          latitude: '42.9832406',
          longitude: '-81.243372',
          localName: 'London',
        },
      ]);
    });
  });

  describe('fetchLocations', () => {
    it('should fetch location suggestions', async () => {
      const mockResponse: LocationApiResponse = {
        data: [
          {
            display_name: 'Londres, Grand Londres, Angleterre, Royaume-Uni',
            name: 'Londres',
            lat: '51.5074456',
            lon: '-0.1277653',
            importance: 0.8820890292539882,
          },
          {
            display_name: 'London, Ontario, N6A 3N7, Canada',
            lat: '42.9832406',
            lon: '-81.243372',
            name: 'London',
            importance: 0.6078714571941068,
          },
        ],
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

      const result = await service.fetchLocations('query', 'fr');
      expect(result.data).toEqual(mockResponse);
    });

    it('should throw NotFoundException when an error occurs', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(new NotFoundException()));

      await expect(service.fetchLocations('query', 'fr')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('mapLocationSuggestions', () => {
    it('should map location API response to suggestions DTO', () => {
      const mockResponse: LocationApiResponse = {
        data: [
          {
            display_name: 'Londres, Grand Londres, Angleterre, Royaume-Uni',
            name: 'Londres',
            lat: '51.5074456',
            lon: '-0.1277653',
            importance: 0.8820890292539882,
          },
          {
            display_name: 'London, Ontario, N6A 3N7, Canada',
            lat: '42.9832406',
            lon: '-81.243372',
            name: 'London',
            importance: 0.6078714571941068,
          },
        ],
      };

      const result = service.mapLocationSuggestions(mockResponse);
      expect(result).toEqual([
        {
          name: 'Londres, Grand Londres, Angleterre, Royaume-Uni',
          latitude: '51.5074456',
          longitude: '-0.1277653',
          localName: 'Londres',
        },
        {
          name: 'London, Ontario, N6A 3N7, Canada',
          latitude: '42.9832406',
          longitude: '-81.243372',
          localName: 'London',
        },
      ]);
    });
  });
});
