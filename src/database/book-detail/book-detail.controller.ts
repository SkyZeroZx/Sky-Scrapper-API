import { Controller, Get, Param } from '@nestjs/common';
import { BookDetailService } from './book-detail.service';

@Controller('book-detail')
export class BookDetailController {
  constructor(private readonly bookDetailService: BookDetailService) {}

  @Get(':isbn')
  getBookDetailByIsbn(@Param('isbn') isbn: string) {
    return this.bookDetailService.findBookByIsbn(isbn);
  }
}
