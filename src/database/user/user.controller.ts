import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ROLES_USER } from '@core/constants/role';
import { Auth, UserDecorator as User } from '@core/decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { User as UserEntity } from '../user/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from '@core/helpers';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get('/profile')
  @Auth(ROLES_USER.USER)
  getProfile(@User() user: UserEntity) {
    return this.userService.getUserByEmail(user.email);
  }

  @Patch('/profile')
  @Auth(ROLES_USER.USER)
  updateUser(@User() user: UserEntity, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(user, updateUserDto);
  }

  @Delete(':email')
  deleteUser(@Param('email') email: string) {
    return this.userService.deleteUser(email);
  }

  @Post('/photo')
  @Auth(ROLES_USER.USER)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: `./${process.env.STATIC_SERVER_PATH}`,
        filename: fileNamer,
      }),
    }),
  )
  updateUserPhoto(@UploadedFile() file: Express.Multer.File, @User() user: UserEntity) {
    return this.userService.updateUserPhoto(file.filename, user);
  }
}
