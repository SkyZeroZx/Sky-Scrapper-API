import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { IBook } from '@core/interface';
import { Book } from './entities/book.entity';
import { PageDto, PageMetaDto, PageOptionsDto } from '@core/dto/pagination';
import { BookDetailService } from '../book-detail/book-detail.service';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<Book>,
    private readonly bookDetailService: BookDetailService,
  ) {}

  async createNewBookService(book: IBook): Promise<Book> {
    try {
      const createBookDetail = await this.bookDetailService.createBookDetail(book);
      const create = await this.bookModel
        .findOneAndUpdate(
          {
            isbn: book.isbn,
          },
          {
            isbn: book.isbn,
            image: book.image,
            $addToSet: { bookDetail: createBookDetail },
          },
          {
            upsert: true,
          },
        )
        .exec();
      return create;
    } catch (error) {
      this.logger.error('Error creating book');
      this.logger.error(error);
      throw new InternalServerErrorException('Error creating book');
    }
  }

  async getBookPagination(pageOptionsDto: PageOptionsDto) {
    const hiddenFields: PipelineStage.Project = {
      $project: { _id: 0, __v: 0, bookDetail: 0 },
    };

    const sortPrice: PipelineStage.Sort = {
      $sort: { price: pageOptionsDto.order },
    };

    const lookup: PipelineStage.Lookup = {
      $lookup: {
        from: 'bookdetails',
        localField: 'isbn',
        foreignField: 'isbn',
        as: 'bookDetails',
        pipeline: [hiddenFields, sortPrice],
      },
    };

    const match: PipelineStage.Match = {
      $match: {
        $or: [
          {
            'bookDetails.title': RegExp(`.*${pageOptionsDto.search}.*`, 'i'),
          },
          {
            'bookDetails.isbn': pageOptionsDto.search,
          },
        ],
      },
    };

    const pipelineStagePagination: PipelineStage[] = [
      lookup,
      match,
      hiddenFields,
      {
        $sort: { 'bookDetails.price': pageOptionsDto.order },
      },
      {
        $skip: pageOptionsDto.skip,
      },
      {
        $limit: pageOptionsDto.take,
      },
    ];

    const queryPagination = this.bookModel.aggregate(pipelineStagePagination);

    const queryCount = this.bookModel.aggregate([
      lookup,
      match,
      {
        $count: 'itemCount',
      },
    ]);
    const [[count], books] = await Promise.all([queryCount, queryPagination]);

    const pageMetaDto = new PageMetaDto({ itemCount: count?.itemCount, pageOptionsDto });

    return new PageDto(books, pageMetaDto);
  }
}
