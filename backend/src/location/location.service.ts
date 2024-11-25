import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import {
  CreateLocationDto,
  LocationApiResponse,
  LocationSuggestionsDto,
} from './dtos/location.dto';
import { Location } from './entity/location.entity';

@Injectable()
export class LocationService {
  private readonly locationApiUrl = process.env.LOCATION_API_URL;

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
  ) {}

  async saveUserFavoriteLocation(
    email: string,
    createLocationDto: CreateLocationDto,
  ): Promise<boolean> {
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    let location = await this.locationRepository.findOneBy({
      latitude: createLocationDto.latitude,
      longitude: createLocationDto.longitude,
    });
    if (!location) {
      location = {
        ...createLocationDto,
      } as Location;
    }
    location.users.push(user);
    await this.locationRepository.save(location);
    return true;
  }

  async searchLocations(
    location: string,
    locale: string,
  ): Promise<LocationSuggestionsDto[]> {
    const response = await this.fetchLocations(location, locale);
    return this.mapLocationSuggestions(response);
  }

  async fetchLocations(
    query: string,
    locale: string,
  ): Promise<LocationApiResponse> {
    const url = `${this.locationApiUrl}?q=${query}&limit=5&format=json&accept-language=${locale}&layer=address`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return response;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  mapLocationSuggestions(
    response: LocationApiResponse,
  ): LocationSuggestionsDto[] {
    const uniqueResults = response.data.filter(
      (value, index, self) =>
        self.findIndex((t) => t.display_name === value.display_name) === index,
    );
    return uniqueResults.map((result) => ({
      name: result.display_name,
      latitude: result.lat,
      longitude: result.lon,
      localName: result.name,
    }));
  }
}
