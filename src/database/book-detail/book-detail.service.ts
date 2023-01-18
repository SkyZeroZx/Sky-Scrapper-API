import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBook } from '@core/interface';
import { BookDetail } from './entities/book-detail.entity';

@Injectable()
export class BookDetailService {
  private readonly logger = new Logger(BookDetailService.name);
  constructor(
    @InjectModel(BookDetail.name)
    private readonly bookDetailModel: Model<BookDetail>,
  ) {}

  async clearPriceNull() {
    try {
      await this.bookDetailModel.deleteMany({
        price: null,
      });
    } catch (err) {
      this.logger.error('Error clearing price null');
      this.logger.error(err);
    }
  }

  async findByMultiIsbn(listIsbn: string[]) {
    try {
      return this.bookDetailModel.aggregate([
        { $match: { isbn: { $in: listIsbn } } },
        {
          $group: {
            _id: '$isbn',
            price: { $min: '$price' },
            title: {
              $first: '$title',
            },
            isbn: {
              $first: '$isbn',
            },
            image: {
              $first: '$image',
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error while searching multi isbn');
    }
  }

  async findBookByIsbn(isbn: string): Promise<BookDetail[]> {
    const listBookDetail = await this.bookDetailModel.find(
      {
        isbn,
      },
      {
        _id: 0,
        __v: 0,
      },
      {
        sort: { price: 1 },
      },
    );
    return listBookDetail;
  }

  async createBookDetail(book: IBook): Promise<BookDetail> {
    try {
      const newBook = await this.bookDetailModel.findOneAndUpdate(
        {
          isbn: book.isbn,
          shop: book.shop,
        },
        {
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          shop: book.shop,
          price: book.price,
          linkProduct: book.linkProduct,
          isAvailable: book.isAvailable,
          image: book.image,
          category: book.category,
          editorial: book.editorial,
        },
        { upsert: true },
      );

      return newBook;
    } catch (error) {
      this.logger.error('Error creating book detail');
      this.logger.error(error);
      throw new InternalServerErrorException('Error creating BOOK DETAIL');
    }
  }
}
