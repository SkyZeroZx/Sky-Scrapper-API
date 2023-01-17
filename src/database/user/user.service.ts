import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { generate } from 'generate-password';
import { MSG_OK } from '@core/constants';
import { generateHashPassword } from '@core/utils';
import { transporter } from '@core/config';
import { MAIL_CREATE_USER, MAIL_RESET_USER } from '@core/constants/mail';
import { ListWish } from '../list-wish/entities/list-wish.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from '@core/interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Response> {
    this.logger.log({ message: 'Creating user', info: createUserDto });

    const existUser = await this.getUserByEmail(createUserDto.email);
    if (existUser) {
      throw new BadRequestException('User already exists');
    }

    let generatePassword: string;

    try {
      generatePassword = generate({
        length: 10,
        numbers: true,
      });

      await transporter.sendMail({
        from: 'Sky Scrapper',
        to: createUserDto.email,
        subject: 'Creacion de nuevo usuario Sky Scrapper',
        html: MAIL_CREATE_USER(createUserDto.email, generatePassword),
      });

      this.logger.log(`Send mail successfully`);
    } catch (error) {
      this.logger.error({ message: 'Error sending email to user', error });
      throw new InternalServerErrorException('Error sending email to user');
    }

    try {
      const hashPassword = generateHashPassword(generatePassword);

      const createdUser = new this.userModel({ ...createUserDto, password: hashPassword });
      await createdUser.save();
    } catch (error) {
      this.logger.error({ message: 'Error creating user', error });
      throw new InternalServerErrorException('Error creating user');
    }

    return { message: MSG_OK, info: 'User created successfully' };
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne(
      { email },
      {
        __v: 0,
      },
    );
  }

  async addListWithToUser(listWish: any, user: User): Promise<Response> {
    try {
      await this.userModel.findOneAndUpdate(
        {
          email: user.email,
        },
        {
          $addToSet: { listWish: listWish },
        },
        {
          upsert: true,
          new: true,
        },
      );
      return { message: MSG_OK, info: 'Item List Wish added successfully' };
    } catch (error) {
      this.logger.error({ message: 'Error update list wish to user', error });
      throw new InternalServerErrorException('Error update list wish to user');
    }
  }

  async removeListWithToUser(removeItem: ListWish, user: User): Promise<Response> {
    try {
      this.logger.log({ message: 'Removing items of list wish', info: { removeItem, user } });
      await this.userModel
        .updateOne(
          {
            email: user.email,
          },
          { $pull: { listWish: { $eq: removeItem._id } } },
        )
        .exec();
      return { message: MSG_OK, info: 'Item List Wish removed successfully' };
    } catch (error) {
      this.logger.error({ message: 'Error removing user of list wish', error });
      throw new InternalServerErrorException('Error removing user of list wish');
    }
  }

  async updatePassword(user: User): Promise<Response> {
    try {
      await this.userModel.findByIdAndUpdate(user._id, {
        password: user.password,
      });

      return { message: MSG_OK, info: 'Password Update successfully' };
    } catch (error) {
      this.logger.error({ message: `Error updating password ${user.email}`, error });
      throw new InternalServerErrorException('Error updating password');
    }
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<Response> {
    try {
      await this.userModel.findOneAndUpdate(
        { email: user.email },
        {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
        },
      );

      return { message: MSG_OK, info: 'User Update successfully' };
    } catch (error) {
      this.logger.error({ message: 'Error in updating user', error });
      throw new InternalServerErrorException('Sucedio un error al actualizar al usuario');
    }
  }

  async resetUser(email: string): Promise<Response> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const generatePassword = generate({
        length: 10,
        numbers: true,
      });

      const updateUser = {
        ...user,
        password: generatePassword,
      } as User;

      await this.updatePassword(updateUser);
      await transporter.sendMail({
        from: 'Sky Scrapper',
        to: email,
        subject: 'Reseteo Contraseña Usuario',
        html: MAIL_RESET_USER(email, generatePassword),
      });
      return { message: MSG_OK, info: 'User Reset successfully' };
    } catch (error) {
      this.logger.error({ message: 'Error reseting user', error });
      throw new InternalServerErrorException('Error reseting user');
    }
  }

  async deleteUser(email: string) {
    try {
      await this.userModel.findOneAndRemove({ email });
      return { message: MSG_OK, info: 'User deleted successfully' };
    } catch (error) {
      this.logger.error({ message: 'error deleted user', error });
      throw new InternalServerErrorException('Error deleted user');
    }
  }

  async updateUserPhoto(fileName: string, user: User) {
    this.logger.log({ message: 'user upload photo', info: { user, fileName } });
    try {
      await this.userModel.findOneAndUpdate(
        { email: user.email },
        {
          image: `${process.env.STATIC_SERVER_PATH}/${fileName}`,
        },
      );

      return {
        message: MSG_OK,
        info: 'User Photo Update successfully',
        data: `${process.env.STATIC_SERVER_PATH}/${fileName}`,
      };
    } catch (error) {
      this.logger.error({ message: 'Error in updating user', error });
      throw new InternalServerErrorException('Sucedio un error al actualizar al usuario');
    }
  }
}
