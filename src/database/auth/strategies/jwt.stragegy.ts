import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JWT_TOKEN } from '@core/constants';
import { USER_STATUS } from '@core/constants/user-status';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(private userService: UserService, private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>(JWT_TOKEN),
    });
  }

  async validate(payload: any) {
    this.logger.log({message : 'validate user payload', payload});

    const user = await this.userService.getUserByEmail(payload.email);
    switch (user.status) {
      case USER_STATUS.CREATED:
      case USER_STATUS.ENABLED:
        return user;
      default:
        this.logger.warn(`Su usuario no se encuentra autorizado`);
        throw new UnauthorizedException({
          message: `Su usuario no se encuentra autorizado , tiene un status ${user.status}`,
        });
    }
  }
}
