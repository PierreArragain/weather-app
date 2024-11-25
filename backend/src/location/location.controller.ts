import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  CreateLocationDto,
  LocationQueryDto,
  LocationSuggestionsDto,
} from './dtos/location.dto';
import { LocationService } from './location.service';
import { AuthenticationGuard } from 'src/acl/authentication.guard';
import { SessionUserEmail } from 'src/acl/session-user-email.decorator';
import { Location } from './entity/location.entity';

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
  @Get('/user-favorites')
  async getUserFavoriteLocations(
    @SessionUserEmail() email: string,
  ): Promise<Location[]> {
    return this.locationService.getUserFavoriteLocations(email);
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
