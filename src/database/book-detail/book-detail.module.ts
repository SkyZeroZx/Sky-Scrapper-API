import { Module } from '@nestjs/common';
import { BookDetailService } from './book-detail.service';
import { BookDetailController } from './book-detail.controller';
import { BookDetail, BookDetailSchema } from './entities/book-detail.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BookDetail.name,
        schema: BookDetailSchema,
      },
    ]),
  ],
  controllers: [BookDetailController],
  providers: [BookDetailService],
  exports : [BookDetailService]
})
export class BookDetailModule {}
