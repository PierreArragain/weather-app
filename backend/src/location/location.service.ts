import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  LocationApiResponse,
  LocationSuggestionsDto,
} from './dtos/location.dto';

@Injectable()
export class LocationService {
  private readonly apiKey = process.env.OPENWEATHERMAP_API_KEY;
  private readonly locationApiUrl = process.env.LOCATION_API_URL;

  constructor(private readonly httpService: HttpService) {}

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
      console.log({ response });
      return response;
    } catch (error) {
      console.error(error);
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
      country: result.country,
      state: result.state,
      latitude: result.lat,
      longitude: result.lon,
      localName: result.name,
    }));
  }
}
