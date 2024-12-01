import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthenticatedRequest, CreateUserDto } from './dtos/user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let jwtService: JwtService;

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
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  describe('authenticate', () => {
    it('should return 200 and token if credentials are valid', async () => {
      const user: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const token = { token: 'jwt-token' };
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      jest.spyOn(userService, 'authenticate').mockResolvedValue(token);

      await controller.authenticate(user, response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ token: token.token });
      expect(response.cookie).toHaveBeenCalledWith('jwtToken', token.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      });
    });

    it('should return 401 if credentials are invalid', async () => {
      const user: CreateUserDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(userService, 'authenticate').mockResolvedValue(null);

      await controller.authenticate(user, response);

      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Unvalid credentials',
      });
    });

    it('should return 500 if an error occurs', async () => {
      const user: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(userService, 'authenticate')
        .mockRejectedValue(new Error('Internal server error'));

      await controller.authenticate(user, response);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('logout', () => {
    it('should clear the jwtToken cookie and return success', () => {
      const response = {
        clearCookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      controller.logout(response);

      expect(response.clearCookie).toHaveBeenCalledWith('jwtToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });
      expect(response.send).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('getStatus', () => {
    it('should return authenticated status and email', () => {
      const request = {
        session: {
          email: 'test@example.com',
        },
      } as AuthenticatedRequest;

      const result = controller.getStatus(request);

      expect(result).toEqual({
        authenticated: true,
        email: 'test@example.com',
      });
    });
  });
});
