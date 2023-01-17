import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { NotificationModule } from '../notification/notification.module';
import { HistoryPriceModule } from '../history-price/history-price.module';
import { ListWishModule } from '../list-wish/list-wish.module';
import {
  CommunitasModule,
  CrisolModule,
  IberoModule,
  VyddistribuidoresModule,
} from '../../scrapper';
import { BookDetailModule } from '../book-detail/book-detail.module';

@Module({
  imports: [
    NotificationModule,
    BookDetailModule,
    HistoryPriceModule,
    ListWishModule,
    CommunitasModule,
    CrisolModule,
    IberoModule,
    VyddistribuidoresModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
