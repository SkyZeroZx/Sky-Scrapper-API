import { Injectable, Logger } from '@nestjs/common';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer';

import { IBook } from '@core/interface';
import { puppeteerLaunchOptions, userAgentOptions } from '@core/config';
import { PUPPETEER_TIMEOUT, SHOPS } from '@core/constants';
import { Book, BookService } from '../../database';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommunitasService {
  private readonly logger = new Logger(CommunitasService.name);

  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

  async getDataViaPuppeteer(location: string | number = ''): Promise<IBook[]> {
    const URL = `https://www.communitas.pe/es/18940-manga?p=${location}`;
    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();

    const browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--start-maximized',
        '--no-sandbox',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      headless: true,
    });
    this.logger.log('My user agent: ' + userAgent);
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.goto(URL, {
      timeout: this.configService.get<number>(PUPPETEER_TIMEOUT),
      waitUntil: 'networkidle2',
    });

    const results = await page.evaluate(() => {
      const listBooks: IBook[] = [];
      document.querySelectorAll('li.ajax_block_product').forEach((z) => {
        const parent = 'div > div > ';

        const book: IBook = {
          title: z.querySelector(`${parent} .product_title_link`)?.textContent,
          price: +z.querySelector(`${parent} .price`)?.textContent?.substring(4),
          author: z.querySelectorAll(`${parent} .product_entity`)[0]?.textContent,
          editorial: z.querySelectorAll(`${parent} .product_entity`)[1]?.textContent,
          category: z.querySelector(`${parent} .category_name`)?.textContent,
          image: z.querySelector(`${parent} a.product_img_link > img`)?.['src'],
          linkProduct: z.querySelector(`${parent} .product_img_link`)?.['href'],
          shop: 'Communitas',
          isAvailable:
            z.querySelector(`${parent} .exclusive`)?.textContent === 'Agregar' ? true : false,
          isbn: z
            .querySelector(`${parent} .product_img_link`)
            ?.['href']?.slice(-18)
            .substring(0, 13),
        };

        listBooks.push(book);
      });

      return listBooks;
    });
    await browser.close();
    return results;
  }

  async getTotalPageByCategory(category: string = '18940-manga'): Promise<number> {
    const URL = `https://www.communitas.pe/es/${category}`;
    const browser = await puppeteer.launch(puppeteerLaunchOptions);
    const userAgent = new UserAgent(userAgentOptions).toString();
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.goto(URL, {
      waitUntil: 'networkidle2',
    });
    const results = await page.evaluate(() => {
      const elementPagination = document.querySelectorAll('div.pagination > ul.pagination >li')[5];
      const numberOfPage = elementPagination.querySelector('a')?.textContent;
      return parseInt(numberOfPage);
    });
    await browser.close();
    return results;
  }

  async scrapperCommunitas(): Promise<void> {
    try {
      const numberOfPage = await this.getTotalPageByCategory();

      for (let i = 0; i < numberOfPage; i++) {
        await this.registerDataOfCommunitas(i);
      }
    } catch (error) {
      this.logger.error({
        message: 'Error registering data',
        page: { message: `Error in page ${location}` },
      });
    }
  }

  async registerDataOfCommunitas(location: string | number = '1'): Promise<void> {
    try {
      const listCreateNewBook: Promise<Book>[] = [];
      const listBooks = await this.getDataViaPuppeteer(location);
      for (const book of listBooks) {
        listCreateNewBook.push(this.bookService.createNewBookService(book));
      }
      await Promise.all(listCreateNewBook);
      this.logger.log({ message: 'Register Data Of Communitas', data: listBooks });
    } catch (error) {
      this.logger.error('Error registering data');
      this.logger.error(error);
    }
  }
}
