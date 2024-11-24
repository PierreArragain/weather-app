import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/auth')
  async authenticate(@Body() user: CreateUserDto) {
    return this.userService.authenticate(user.email, user.password);
  }

  @Post()
  async register(@Body() user: CreateUserDto) {
    return this.userService.register(user);
  }
}
