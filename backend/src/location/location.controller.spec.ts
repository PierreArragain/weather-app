import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateLocationDto,
  LocationQueryDto,
  LocationSuggestionsDto,
} from './dtos/location.dto';
import { Location } from './entity/location.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            searchLocations: jest.fn(),
            getUserFavoriteLocations: jest.fn(),
            saveUserFavoriteLocation: jest.fn(),
            deleteLocationFromUserFavorites: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchLocations', () => {
    it('should return an array of location suggestions', async () => {
      const result: LocationSuggestionsDto[] = [
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
      ];
      jest.spyOn(service, 'searchLocations').mockResolvedValue(result);

      const query: LocationQueryDto = { location: 'londres', locale: 'fr' };
      expect(await controller.searchLocations(query)).toBe(result);
    });

    describe('getUserFavoriteLocations', () => {
      it('should return an array of user favorite locations', async () => {
        const location = new Location();
        location.id = 1;
        location.name = 'Paris';
        location.latitude = '48.8566';
        location.longitude = '2.3522';
        location.localName = 'Paris';
        const result: Location[] = [location];
        jest
          .spyOn(service, 'getUserFavoriteLocations')
          .mockResolvedValue(result);

        expect(
          await controller.getUserFavoriteLocations('test@example.com'),
        ).toBe(result);
      });
    });

    describe('saveUserFavoriteLocation', () => {
      it('should save a user favorite location and return true', async () => {
        const createLocationDto: CreateLocationDto = {
          name: 'Paris',
          latitude: '48.8566',
          longitude: '2.3522',
          localName: 'Paris',
        };
        jest.spyOn(service, 'saveUserFavoriteLocation').mockResolvedValue(true);

        expect(
          await controller.saveUserFavoriteLocation(
            createLocationDto,
            'test@example.com',
          ),
        ).toBe(true);
      });
    });

    describe('deleteUserFavoriteLocation', () => {
      it('should delete a user favorite location and return true', async () => {
        jest
          .spyOn(service, 'deleteLocationFromUserFavorites')
          .mockResolvedValue(true);

        expect(
          await controller.deleteUserFavoriteLocation(1, 'test@example.com'),
        ).toBe(true);
      });
    });
  });
});
