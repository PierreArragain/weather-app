import { Test, TestingModule } from '@nestjs/testing';
import { LocationQueryDto, LocationSuggestionsDto } from './dtos/location.dto';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            searchLocations: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
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
  });
});
