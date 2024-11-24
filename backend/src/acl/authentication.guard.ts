import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token: string[] = request.headers.authorization.split(' ');
      return this.checkToken(request, token[1] ?? '');
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  checkToken(request, token: string): boolean {
    request.session = this.jwtService.verify(token);
    return true;
  }
}
