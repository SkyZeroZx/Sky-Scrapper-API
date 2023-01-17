import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getName() {
    return { app: 'Sky Scrapper' };
  }
}
