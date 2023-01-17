import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import UserAgent from 'user-agents';
import { BLOCK_RESOURCE_TYPE, BLOCK_SOURCE_NAME } from '@core/constants';
import { IBook } from '@core/interface';
import { userAgentOptions, puppeteerLaunchOptions } from '@core/config';
import { Book, BookService } from '../../database';

@Injectable()
export class CrisolService {
  private readonly logger = new Logger(CrisolService.name);
  constructor(private readonly bookService: BookService) {}

  async getDataViaPuppeteer(location: string | number = '1') {
    const URL = `https://www.crisol.com.pe/ficcion/mangas?p=${location}`;
    const userAgent = new UserAgent(userAgentOptions).toString();
    const browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const requestUrl = request.url();
      if (
        request.resourceType() in BLOCK_RESOURCE_TYPE ||
        BLOCK_SOURCE_NAME.some((resource) => requestUrl.includes(resource))
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(URL, {
      waitUntil: 'networkidle2',
    });

    const results = await page.evaluate(() => {
      const listBooks: IBook[] = [];

      document.querySelectorAll('div.products > ol.products > li.item ').forEach((z) => {
        const parent = 'div > div > ';
        const parentImg =
          'div > a.product  > span.product-image-container > span.product-image-wrapper';
        const parentPrice = 'div.list-view > div.price-box  > span.price-container > span >';
        const parentAvariable =
          'div.product-item-inner > div.product > div.actions-primary > div.unavailable > ';
        const book: IBook = {
          title: z.querySelector(`${parent} strong.product`)?.textContent.trim(),
          price: +z.querySelector(`${parentPrice} .price`)?.textContent.substring(3),
          author: z.querySelector(`${parent} .author`)?.textContent.trim(),
          category: 'Manga',
          linkProduct: z.querySelector(`${parent} a.product`)?.['href'],
          isbn: z.querySelector(`${parent} a.product`)?.['href'].slice(-13),
          isAvailable: !(
            z.querySelector(`${parentAvariable} span`)?.textContent.trim() == 'No hay stock'
          ),
          image: z.querySelector(`${parentImg} img.product-image-photo`)?.['src'],
          shop: 'Crisol',
        };

        listBooks.push(book);
      });

      return listBooks;
    });

    await browser.close();
    return results;
  }

  async getTotalPageByCategory(category: string = 'mangas'): Promise<number> {
    const URL = `https://www.crisol.com.pe/ficcion/${category}?p=2`;
    const browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.goto(URL, {
      waitUntil: 'networkidle2',
    });

    const results = await page.evaluate(() => {
      const totalItems = document.querySelectorAll('p.toolbar-amount > span.toolbar-number')[2]
        ?.textContent;
      return parseInt(totalItems);
    });
    await browser.close();
    // Items peer page is 15 by default
    const totalPages = Math.ceil(results / 15);
    return totalPages;
  }

  async scrapperCrisol(): Promise<void> {
    try {
      const numberOfPage = await this.getTotalPageByCategory();

      for (let i = 0; i < numberOfPage; i++) {
        await this.registerDataOfCrisol(i);
      }
      
      this.logger.log('Finalized scrapper Crisol');
    } catch (error) {
      this.logger.error('Error in Scrapper Communitas');
      this.logger.error(error);
      throw new Error('Error Scrapping Communitas Mangas');
    }
  }

  async registerDataOfCrisol(location: string | number = '1'): Promise<void> {
    try {
      const listCreateNewBook: Promise<Book>[] = [];
      const listBooks = await this.getDataViaPuppeteer(location);
      for (const book of listBooks) {
        listCreateNewBook.push(this.bookService.createNewBookService(book));
      }
      await Promise.all(listCreateNewBook);
      this.logger.log({ message: 'Register Data Of Crisol', data: listBooks });
    } catch (error) {
      this.logger.error('Error registering data');
      this.logger.error(error);
    }
  }
 
}
