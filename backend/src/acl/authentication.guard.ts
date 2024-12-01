import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../user/dtos/user.dto';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.cookies?.jwtToken;
      if (!token) {
        return false;
      }

      return this.checkToken(request, token);
    } catch (error) {
      throw new UnauthorizedException(
        "You're not authorized to access this resource",
      );
    }
  }

  async checkToken(
    request: AuthenticatedRequest,
    token: string,
  ): Promise<boolean> {
    try {
      request.session = await this.jwtService.verify(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token is not valid');
    }
  }
}
