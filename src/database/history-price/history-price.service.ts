import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookService } from '../book/book.service';
import { HistoryPrice } from './entities/history-price.entity';

@Injectable()
export class HistoryPriceService {
  private readonly logger = new Logger(HistoryPriceService.name);

  constructor(
    @InjectModel(HistoryPrice.name)
    private readonly historyPriceModel: Model<HistoryPrice>,
    private bookService: BookService,
  ) {}

  async registerMinorPriceByIsbn() {
    const take = 200;
    let skip = 0;
    let nextPageExist = true;
    let page: number = 1;
    let listAllData = [];

    while (nextPageExist) {
      skip = (page - 1) * take;
      const { meta, data } = await this.bookService.getBookPagination({
        order: 1,
        page: page,
        take: take,
        search: '',
        skip: skip,
      });
      const listMinorPrice = data.map((res) => {
        return res.bookDetails[0];
      });
      listAllData.push(...listMinorPrice);
      page++;
      nextPageExist = meta.hasNextPage;
    }
    await this.createHistoryPrice(listAllData);
    this.logger.log('Finished registering history price');
  }

  async createHistoryPrice(listPrice: any[]) {
    await this.historyPriceModel.insertMany([...listPrice]);
  }

  async getVariationPriceIsbn(): Promise<string[]> {
    const currentDate = new Date();
    const listVariationPrice = await this.historyPriceModel.aggregate([
      {
        $match: {
          registerDate: {
            $gte: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() - 1,
            ),
            $lt: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() + 1,
            ),
          },
        },
      },
      {
        $group: {
          _id: '$isbn',
          previousPrice: { $first: '$price' },
          nextPrice: { $last: '$price' },
        },
      },
      {
        $match: {
          $expr: {
            $lt: ['$nextPrice', '$previousPrice'],
          },
        },
      },
    ]);
    const listIsbnVariation: string[] = listVariationPrice.map(({ _id }) => _id);
    return listIsbnVariation;
  }

  async findOne(isbn: string) {
    return await this.historyPriceModel.find(
      { isbn },
      {
        _id: 0,
        __v: 0,
      },
    );
  }
}
