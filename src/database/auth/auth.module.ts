import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { JWT_TOKEN } from '@core/constants';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.stragegy';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Authentication, AuthenticationSchema } from './entities/authentication.entity';
import { Challenge, ChallengeSchema } from './entities/challenge.entity';

@Module({
  imports: [
    PassportModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: Authentication.name,
        schema: AuthenticationSchema,
      },
      {
        name: Challenge.name,
        schema: ChallengeSchema,
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(JWT_TOKEN),
        signOptions: { expiresIn: '120h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
