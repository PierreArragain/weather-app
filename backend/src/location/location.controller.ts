import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../acl/authentication.guard';
import { SessionUserEmail } from '../acl/session-user-email.decorator';
import {
  CreateLocationDto,
  LocationQueryDto,
  LocationSuggestionsDto,
} from './dtos/location.dto';
import { Location } from './entity/location.entity';
import { LocationService } from './location.service';

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

  @Delete(':id')
  async deleteUserFavoriteLocation(
    @Param('id') id: number,
    @SessionUserEmail() email: string,
  ): Promise<boolean> {
    return this.locationService.deleteLocationFromUserFavorites(email, id);
  }
}
