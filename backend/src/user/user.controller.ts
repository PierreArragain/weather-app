import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../acl/authentication.guard';
import {
  AuthenticatedRequest,
  CreateUserDto,
  JwtTokenIfOk,
} from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/auth/status')
  @UseGuards(AuthenticationGuard)
  getStatus(@Req() request: AuthenticatedRequest) {
    const session = request.session;
    return {
      authenticated: true,
      email: session.email,
    };
  }

  @Post('/auth')
  async authenticate(@Body() user: CreateUserDto, @Res() response: Response) {
    try {
      const token: JwtTokenIfOk = await this.userService.authenticate(
        user.email,
        user.password,
      );
      if (!token) {
        return response.status(401).json({ message: 'Unvalid credentials' });
      }

      response.cookie('jwtToken', token.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return response.status(200).json({ token: token.token });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('/logout')
  logout(@Res() response: Response) {
    response.clearCookie('jwtToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return response.send({ success: true });
  }

  @Post()
  async register(@Body() user: CreateUserDto) {
    return this.userService.register(user);
  }
}
