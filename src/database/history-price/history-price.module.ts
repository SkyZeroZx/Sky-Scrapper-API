import { Module } from '@nestjs/common';
import { HistoryPriceService } from './history-price.service';
import { HistoryPriceController } from './history-price.controller';
import { BookModule } from '../book/book.module';
import { HistoryPrice, HistoryPriceSchema } from './entities/history-price.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { BookDetailModule } from '../book-detail/book-detail.module';
 

@Module({
  imports: [
    BookModule,
    BookDetailModule,
    MongooseModule.forFeature([
      {
        name: HistoryPrice.name,
        schema: HistoryPriceSchema,
      },
    ]),
  ],
  controllers: [HistoryPriceController],
  providers: [HistoryPriceService],
  exports: [HistoryPriceService],
})
export class HistoryPriceModule {}
