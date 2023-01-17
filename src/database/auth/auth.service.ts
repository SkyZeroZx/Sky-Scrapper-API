import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { USER_STATUS } from '@core/constants/user-status';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './dtos/change-passsword.dto';
import { generateHashPassword } from '@core/utils';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Model } from 'mongoose';
import { Challenge } from './entities/challenge.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Authentication } from './entities/authentication.entity';
import {
  generateAuthenticationOption,
  generateRegistrationOption,
  verifyAuthenticationOption,
  verifyAuthWeb,
} from '@core/config';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { Response } from '@core/interface';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';
import {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server/./dist';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<Challenge>,
    @InjectModel(Authentication.name)
    private readonly authenticationModel: Model<Authentication>,
  ) {}

  async validateUser(email: string, password: string) {
    this.logger.log('Validation user');
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      this.logger.warn(`Login fail user: ${email}`);
      return null;
    }

    const matchPassword: boolean = await compare(password, user.password);
    if (user && matchPassword) {
      this.logger.log(`Login success user: ${email}`);
      return user;
    }
    return null;
  }

  generateToken(user: User) {
    const payload = {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    };

    switch (user.status) {
      case USER_STATUS.CREATED:
      case USER_STATUS.ENABLED:
        return {
          ...payload,
          token: this.jwtService.sign(payload),
        };
      default:
        throw new BadRequestException(`Status of user is :  ${user.status}`);
    }
  }

  async signIn(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  async resetUser(email: string) {
    return this.userService.resetUser(email);
  }

  async changePassword(
    user: User,
    { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<Response> {
    if (oldPassword === newPassword) {
      this.logger.warn('Dont not repeat previous password');
      throw new BadRequestException({
        message: 'No puede repetir la contraseña antigua para la nueva contraseña',
      });
    }
    user.password = generateHashPassword(newPassword);
    user.status = USER_STATUS.ENABLED;
    const { password } = await this.userService.getUserByEmail(user.email);

    const matchPassword = await compare(oldPassword, password);
    if (matchPassword) {
      return this.userService.updatePassword(user);
    }

    this.logger.warn('previous password not match with send password');
    throw new BadRequestException('Hubo un error al cambiar la contraseña , validar');
  }

  async saveUserAuthenticators(user: User, id: string, data: VerifiedRegistrationResponse) {
    try {
      const saveAutentication = new this.authenticationModel({
        idAuthentication: id,
        userEmail: user.email,
        credentialPublicKey: data.registrationInfo.credentialPublicKey,
        credentialID: data.registrationInfo.credentialID,
      });
      return await saveAutentication.save();
    } catch (error) {
      this.logger.error({ message: 'Error save authentication', error });
      throw new InternalServerErrorException('Error saving authentication');
    }
  }

  async getAuthenticatorsByEmail(email: string): Promise<Authentication[]> {
    try {
      return this.authenticationModel.find({ email });
    } catch (error) {
      this.logger.error({ message: 'Error getting authenticators', error });
      throw new InternalServerErrorException('Error getting previous authenticators');
    }
  }

  async getCurrentChallenge(email: string) {
    try {
      return this.challengeModel.findOne({ userEmail: email });
    } catch (error) {
      this.logger.error({ message: 'Error getting challenge', error });
      throw new InternalServerErrorException('Error getting challenge');
    }
  }

  async registerCurrentChallenge(email: string, challenge: string): Promise<void> {
    try {
      await this.challengeModel
        .findOneAndUpdate(
          { userEmail: email },
          {
            currentChallenge: challenge,
          },
          {
            upsert: true,
          },
        )
        .exec();
    } catch (error) {
      this.logger.error({ message: 'Error registering challenge', error });
      throw new InternalServerErrorException('Error registering challenge');
    }
  }

  async getUserAuthenticationById(
    email: string,
    idAuthentication: string,
  ): Promise<Authentication> {
    try {
      return this.authenticationModel.findOne({
        userEmail: email,
        idAuthentication: idAuthentication,
      });
    } catch (error) {
      this.logger.error('Error get authenticator by id');
      this.logger.error(error);
      throw new InternalServerErrorException('Eror getting user authentication');
    }
  }

  async generateAuthenticationOptions(
    email: string,
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const userAuthenticators = await this.getAuthenticatorsByEmail(email);
    const authOptions = await generateAuthenticationOption(userAuthenticators);
    await this.registerCurrentChallenge(email, authOptions.challenge);
    return authOptions;
  }

  async verifyAuthentication(
    email: string,
    authenticationResponseJSON: AuthenticationResponseJSON,
  ): Promise<VerifiedAuthenticationResponse> {
    const { currentChallenge } = await this.getCurrentChallenge(email);
    const userAuthenticators = await this.getUserAuthenticationById(
      email,
      authenticationResponseJSON.id,
    );
    const verifyOptions = await verifyAuthenticationOption(
      authenticationResponseJSON,
      currentChallenge,
      userAuthenticators,
    );

    if (!verifyOptions.verified) {
      throw new BadRequestException('Authentication invalid');
    }
    const user = await this.userService.getUserByEmail(email);

    Object.assign(verifyOptions, {
      data: this.generateToken(user),
    });

    return verifyOptions;
  }

  async generateRegistration(user: User): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const userAuthenticators = await this.getAuthenticatorsByEmail(user.email);
    const register = generateRegistrationOption(user, userAuthenticators);
    await this.registerCurrentChallenge(user.email, register.challenge);
    return register;
  }

  async verifyRegistration(user: User, verify: RegistrationResponseJSON) {
    const challenge = await this.getCurrentChallenge(user.email);
    const verifyAuthentication = await verifyAuthWeb(verify, challenge.currentChallenge);
    return await this.saveUserAuthenticators(user, verify.id, verifyAuthentication);
  }
}
