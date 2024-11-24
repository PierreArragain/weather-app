import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto, UserAuthDto } from './dtos/user.dto';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockJwtToken'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce({} as User);

      await expect(
        service.register({ email: 'test@test.com' } as CreateUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and save a new user', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        email: 'test@test.com',
        password: 'hashedPassword',
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        uuid: 'uuid',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);

      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'D34DC4F3',
      } as CreateUserDto;
      const result = await service.register(createUserDto);

      expect(result).toBe(true);
    });
  });

  describe('authenticate', () => {
    it('should return false if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const userAuthDto: UserAuthDto = {
        email: 'test@test.com',
        password: 'D34DC4F3',
      };
      const result = await service.authenticate('test@test.com', 'password');

      expect(result).toBe(false);
    });

    it('should return false if password is invalid', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ password: 'hashedPassword' } as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      const result = await service.authenticate('test@test.com', 'password');

      expect(result).toBe(false);
    });

    it('should return a JWT token if authentication is successful', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
        uuid: 'uuid',
        email: 'test@test.com',
        password: 'hashedPassword',
      } as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await service.authenticate('test@test.com', 'password');

      expect(result).toEqual({ token: 'mockJwtToken' });
    });
  });

  describe('generateJwtToken', () => {
    it('should return a JWT token', async () => {
      const user = { uuid: 'uuid', email: 'test@test.com' } as User;
      const result = await service.generateJwtToken(user);

      expect(result).toEqual({ token: 'mockJwtToken' });
    });
  });

  describe('generateJwtPayload', () => {
    it('should return a JWT payload', () => {
      const user = { uuid: 'uuid', email: 'test@test.com' } as User;
      const result = service.generateJwtPayload(user);

      expect(result).toEqual({ uuid: 'uuid', email: 'test@test.com' });
    });
  });
});
