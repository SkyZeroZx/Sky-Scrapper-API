import { Module } from '@nestjs/common';
import { ListWishService } from './list-wish.service';
import { ListWishController } from './list-wish.controller';
import { ListWish, ListWishSchema } from './entities/list-wish.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { BookDetailModule } from '../book-detail/book-detail.module';

@Module({
  imports: [
    UserModule,
    BookDetailModule,
    MongooseModule.forFeature([
      {
        name: ListWish.name,
        schema: ListWishSchema,
      },
    ]),
  ],
  controllers: [ListWishController],
  providers: [ListWishService],
  exports : [ListWishService]
})
export class ListWishModule {}
