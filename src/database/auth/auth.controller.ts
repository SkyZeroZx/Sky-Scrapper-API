import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserDecorator as User } from '@core/decorators/user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ChangePasswordDto } from './dtos/change-passsword.dto';
import { Auth } from '@core/decorators/auth.decorator';
import { ROLES_USER } from '@core/constants/role';
import { CreateUserDto } from '../user/dto/create-user.dto';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@User() user: UserEntity) {
    return this.authService.generateToken(user);
  }

  @Auth(ROLES_USER.USER)
  @Get('generate-registration-options')
  async generateRegistration(@User() user: UserEntity) {
    return this.authService.generateRegistration(user);
  }

  @Auth(ROLES_USER.USER)
  @Post('verify-registration')
  async verifyRegistration(@User() user: UserEntity, @Body() verify: RegistrationResponseJSON) {
    return this.authService.verifyRegistration(user, verify);
  }

  @Get('generate-authentication-options/:email')
  async generateAuthenticationOptions(@Param('email') email: string) {
    return this.authService.generateAuthenticationOptions(email);
  }

  @Post('verify-authentication')
  async verifityAuthentication(@Body() authenticationResponseJSON: AuthenticationResponseJSON) {
    return this.authService.verifyAuthentication(
      authenticationResponseJSON['username'],
      authenticationResponseJSON,
    );
  }

  @Post('change-password')
  changePassword(@User() user: UserEntity, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @Post('sign-in')
  signIn(@Body() createUserDto: CreateUserDto) {
    return this.authService.signIn(createUserDto);
  }

  @Get(':email')
  async resetUser(@Param('email') email: string) {
    return this.authService.resetUser(email);
  }
}
