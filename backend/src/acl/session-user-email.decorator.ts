import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from '../user/dtos/user.dto';

export const SessionUserEmail = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const session: JwtPayload = request.session;
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    return session.email;
  },
);
