import { IsEmail, IsNotEmpty } from 'class-validator';

export interface JwtPayload {
  email: string;
  uuid: string;
}

export type JwtTokenIfOk = { token: string } | false;

export class UserAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateUserDto extends UserAuthDto {}
