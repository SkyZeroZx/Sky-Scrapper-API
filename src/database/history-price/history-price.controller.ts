import { Controller, Get, Param, Post } from '@nestjs/common';

import { HistoryPriceService } from './history-price.service';

@Controller('history-price')
export class HistoryPriceController {
  constructor(private readonly historyPriceService: HistoryPriceService) {}

  @Get('discount')
  getLastDiscount() {
    return this.historyPriceService.getLastDiscount();
  }

  @Get(':isbn')
  findOne(@Param('isbn') isbn: string) {
    return this.historyPriceService.findOne(isbn);
  }

  @Post()
  postTest() {
    return this.historyPriceService.registerMinorPriceByIsbn();
  }
}
