import { HttpService } from '@nestjs/axios';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { CreateLocationDto, LocationApiResponse } from './dtos/location.dto';
import { Location } from './entity/location.entity';
import { LocationService } from './location.service';
describe('LocationService', () => {
  let service: LocationService;
  let httpService: HttpService;
  let locationRepository: Repository<Location>;
  let userRepository: Repository<User>;

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
        {
          provide: getRepositoryToken(Location),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    httpService = module.get<HttpService>(HttpService);
    locationRepository = module.get<Repository<Location>>(
      getRepositoryToken(Location),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('saveUserFavoriteLocation', () => {
    it('should save user favorite location', async () => {
      const email = 'test@example.com';
      const createLocationDto: CreateLocationDto = {
        latitude: '51.5074',
        longitude: '-0.1278',
        name: 'London',
        localName: 'Londres',
      };
      const user = new User();
      user.email = email;
      const location = new Location();
      location.latitude = createLocationDto.latitude;
      location.longitude = createLocationDto.longitude;
      location.users = [];

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(locationRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(locationRepository, 'save').mockResolvedValue(location);

      const result = await service.saveUserFavoriteLocation(
        email,
        createLocationDto,
      );
      expect(result).toBe(true);
    });
  });

  describe('getUserFavoriteLocations', () => {
    it('should return user favorite locations', async () => {
      const userEmail = 'test@example.com';
      const locations = [new Location(), new Location()];

      jest.spyOn(locationRepository, 'find').mockResolvedValue(locations);

      const result = await service.getUserFavoriteLocations(userEmail);
      expect(result).toEqual(locations);
    });
  });

  describe('deleteLocationFromUserFavorites', () => {
    it('should delete location from user favorites', async () => {
      const userEmail = 'test@example.com';
      const locationId = 1;
      const user = new User();
      user.email = userEmail;
      const location = new Location();
      location.id = locationId;
      location.users = [user];

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(locationRepository, 'findOneBy').mockResolvedValue(location);
      jest.spyOn(locationRepository, 'save').mockResolvedValue(location);

      const result = await service.deleteLocationFromUserFavorites(
        userEmail,
        locationId,
      );
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const userEmail = 'test@example.com';
      const locationId = 1;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.deleteLocationFromUserFavorites(userEmail, locationId),
      ).rejects.toThrow(UnauthorizedException);
    });
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
