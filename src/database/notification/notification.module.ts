import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, Notificationchema } from './entities/notification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: Notificationchema,
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports : [NotificationService]
})
export class NotificationModule {}
