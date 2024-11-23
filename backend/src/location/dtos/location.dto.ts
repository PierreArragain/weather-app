import { IsString } from 'class-validator';

export interface LocationApiResult {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  country: string;
  importance: number;
  state: string;
}

export interface LocationApiResponse {
  data: LocationApiResult[];
}

export class LocationQueryDto {
  @IsString()
  location: string;
  @IsString()
  locale: string;
}

export class LocationSuggestionsDto {
  name: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  localName: string;
}
