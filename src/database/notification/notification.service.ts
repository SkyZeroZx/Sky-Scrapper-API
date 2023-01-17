import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import webpush from 'web-push';
import { User } from '../user/entities/user.entity';
import { MSG_OK } from '@core/constants';
import { Response } from '@core/interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async createSuscription(
    createNotificationDto: CreateNotificationDto,
    user: User,
  ): Promise<Response> {
    try {
      const count = await this.notificationModel.count({
        tokenPush: createNotificationDto.tokenPush,
        userEmail: user.email,
      });
      if (count == 0) {
        const createNotification = new this.notificationModel({
          ...createNotificationDto,
          userEmail: user.email,
        });
        await createNotification.save();
      }
      return { message: MSG_OK, info: 'suscription created successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error suscription token push');
    }
  }

  async findTokensByEmails(listEmail: string[]): Promise<string[]> {
    const notification = await this.notificationModel.aggregate<Notification>([
      { $match: { userEmail: { $in: listEmail } } },
      {
        $project: {
          _id: 0,
          __v: 0,
          userEmail: 0,
        },
      },
    ]);
    const listTokens: string[] = notification.map(({ tokenPush }) => tokenPush);
    return listTokens;
  }

  async sendNotification(tokenPush: string, message: Object): Promise<void> {
    try {
      const result = await webpush.sendNotification(JSON.parse(tokenPush), JSON.stringify(message));
      this.logger.log({ message: 'send notification result', result });
    } catch (error) {
      this.logger.log('Error send notification');
      this.logger.log(error);
    }
  }
}
