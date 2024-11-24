import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dtos/user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            authenticate: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('authenticate', () => {
    it('should call userService.authenticate with correct parameters', async () => {
      const user: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      await controller.authenticate(user);
      expect(userService.authenticate).toHaveBeenCalledWith(
        user.email,
        user.password,
      );
    });
  });

  describe('register', () => {
    it('should call userService.register with correct parameters', async () => {
      const user: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      await controller.register(user);
      expect(userService.register).toHaveBeenCalledWith(user);
    });
  });
});
