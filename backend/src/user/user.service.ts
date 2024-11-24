import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto, JwtPayload, JwtTokenIfOk } from './dtos/user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(user: CreateUserDto): Promise<boolean> {
    const foundUser = await this.userRepository.findOneBy({
      email: user.email,
    });
    if (foundUser) {
      throw new ConflictException('User already exists');
    }
    const userToCreate = this.userRepository.create(user);
    return !!this.userRepository.save(userToCreate);
  }

  async authenticate(email: string, password: string): Promise<JwtTokenIfOk> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        uuid: true,
        email: true,
        password: true,
      },
    });
    if (!user) {
      return false;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return false;
    }
    return this.generateJwtToken(user);
  }

  async generateJwtToken(user: User): Promise<JwtTokenIfOk> {
    const payload = this.generateJwtPayload(user);
    return {
      token: this.jwtService.sign(payload),
    };
  }

  generateJwtPayload(user: User): JwtPayload {
    return {
      email: user.email,
      uuid: user.uuid,
    };
  }
}
