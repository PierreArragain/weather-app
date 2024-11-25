import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  CreateLocationDto,
  LocationQueryDto,
  LocationSuggestionsDto,
} from './dtos/location.dto';
import { LocationService } from './location.service';
import { AuthenticationGuard } from 'src/acl/authentication.guard';
import { SessionUserEmail } from 'src/acl/session-user-email.decorator';

@UseGuards(AuthenticationGuard)
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('/search')
  async searchLocations(
    @Query() { location, locale }: LocationQueryDto,
  ): Promise<LocationSuggestionsDto[]> {
    return this.locationService.searchLocations(location, locale);
  }

  @Post()
  async saveUserFavoriteLocation(
    @Body() createLocationDto: CreateLocationDto,
    @SessionUserEmail() email: string,
  ): Promise<boolean> {
    return this.locationService.saveUserFavoriteLocation(
      email,
      createLocationDto,
    );
  }
}
