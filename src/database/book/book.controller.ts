import { Controller, Get, Query } from '@nestjs/common';
import { PageOptionsDto } from '@core/dto/pagination';
import { BookService } from './book.service';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  getBook(@Query() pageOptionsDto: PageOptionsDto) {
    return this.bookService.getBookPagination(pageOptionsDto);
  }
}
