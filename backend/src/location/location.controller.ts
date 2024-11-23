import { Controller, Get, Query } from '@nestjs/common';
import { LocationQueryDto } from './dtos/location.dto';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly weatherService: LocationService) {}

  @Get('/search')
  async searchLocations(@Query() { location, locale }: LocationQueryDto) {
    return this.weatherService.searchLocations(location, locale);
  }
}
