import { IsString } from 'class-validator';

export interface LocationApiResult {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
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
  latitude: string;
  longitude: string;
  localName: string;
}

export class SaveUserFavoriteLocationDto {
  @IsString()
  email: string;
  location: CreateLocationDto;
}

export class CreateLocationDto implements LocationSuggestionsDto {
  @IsString()
  name: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsString()
  localName: string;
}
