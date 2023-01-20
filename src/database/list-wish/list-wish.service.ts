import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookDetailService } from '../book-detail/book-detail.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AddItemListWishDto } from './dtos/add-item-list-wish.dto';
import { ListWish } from './entities/list-wish.entity';

@Injectable()
export class ListWishService {
  private readonly logger = new Logger(ListWishService.name);
  constructor(
    @InjectModel(ListWish.name)
    private readonly listWishModel: Model<ListWish>,
    private readonly userService: UserService,
    private readonly bookDetailService: BookDetailService,
  ) {}

  async findListWish(user: User) {
    try {
      const list = await this.listWishModel.find(
        { userEmail: user.email },
        {
          _id: 0,
          __v: 0,
          userEmail: 0,
        },
      );
      const listIsbn = list.map(({ isbn }) => isbn);
      return await this.bookDetailService.findByMultiIsbn(listIsbn);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error find list wish');
    }
  }

  async findEmailsByListIsbn(listIsbn: string[]): Promise<string[]> {
    const listWish = await this.listWishModel.aggregate<ListWish>([
      { $match: { isbn: { $in: listIsbn } } },
      {
        $group: {
          _id: '$userEmail',
        },
      },
    ]);

    const listEmail: string[] = listWish.map(({ _id }) => _id);
    return listEmail;
  }

  async isWish(user: User, isbn: string): Promise<ListWish> {
    try {
      return await this.listWishModel.findOne(
        {
          userEmail: user.email,
          isbn,
        },
        {
          _id: 0,
          __v: 0,
          userEmail: 0,
        },
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error find  wish');
    }
  }

  async addItemListWish(addItemListWish: AddItemListWishDto, user: User) {
    try {
      this.logger.log({ message: 'Creating ListWish', addItemListWish });
      const itemSaved = await this.listWishModel.findOneAndUpdate(
        { isbn: addItemListWish.isbn, userEmail: user.email },
        { isbn: addItemListWish.isbn, userEmail: user.email },
        { new: true, upsert: true },
      );
      const addItemToUser = await this.userService.addListWithToUser(itemSaved, user);
      return addItemToUser;
    } catch (error) {
      this.logger.error('Error add item list wish');
      this.logger.error(error);
      throw new InternalServerErrorException('Error add item list wish');
    }
  }

  async removeItemListWish(isbn: string, user: User) {
    try {
      this.logger.log({ message: 'Removing ListWish', isbn });
      const removeItem = await this.listWishModel.findOneAndRemove({
        isbn: isbn,
        email: user.email,
      });
      await this.userService.removeListWithToUser(removeItem, user);
    } catch (error) {
      this.logger.error('Error removing item list wish of user');
      this.logger.error(error);
      throw new InternalServerErrorException('Error removing item list wish of user');
    }
  }
}
