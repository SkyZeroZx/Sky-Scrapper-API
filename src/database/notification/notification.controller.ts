import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User as UserEntity } from '../user/entities/user.entity';
import { Auth, UserDecorator as User } from '@core/decorators';
import { ROLES_USER } from '@core/constants';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Auth(ROLES_USER.USER)
  create(@Body() createNotificationDto: CreateNotificationDto, @User() user: UserEntity) {
    return this.notificationService.createSuscription(createNotificationDto, user);
  }
}
