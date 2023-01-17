import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import UserAgent from 'user-agents';
import { puppeteerLaunchOptions, userAgentOptions } from '@core/config';
import { BLOCK_RESOURCE_TYPE, BLOCK_SOURCE_NAME } from '@core/constants';
import { IBook } from '@core/interface';
import { Book } from '../../database/book/entities/book.entity';
import { BookService } from '../../database/book/book.service';

@Injectable()
export class VyddistribuidoresService {
  private readonly logger = new Logger(VyddistribuidoresService.name);
  constructor(private readonly bookService: BookService) {}

  category = 'Manga';
  async getDataViaPuppeteer(location: string | number = '1'): Promise<IBook[]> {
    const URL = `https://vyddistribuidores.com/categoria-producto/manga/page/${location}/`;
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
      const listBook: IBook[] = [];

      document.querySelectorAll('li.product  > div.product-inner').forEach((z) => {
        const parent = 'a >';
        const shop = 'Vyddistribuidores';
        const book: IBook = {
          title: z.querySelector(`${parent} div.product-price-box > h2`)?.textContent.trim(),
          price: +z
            .querySelector(
              `${parent} .product-price-box > .price > .woocommerce-Price-amount > bdi `,
            )
            ?.textContent.substring(2),
          author: null,
          category: 'Manga',
          linkProduct: z.querySelector('a')?.href,
          isAvailable:
            z.querySelector(`div.woo-button-wrapper > div.woo-button-border > a[rel="nofollow"]`)
              ?.textContent == 'COMPRA',
          isbn: z
            .querySelector(`${parent} figure.product-image-box > img`)
            ?.['src'].slice(-25)
            .substring(0, 13),
          image: z.querySelector(`${parent} figure.product-image-box > img`)?.['src'],
          shop: shop,
        };

        listBook.push(book);
      });

      return listBook;
    });

    await browser.close();
    return results;
  }

  async getTotalPageByCategory(category: string = 'manga'): Promise<any> {
    const URL = `https://vyddistribuidores.com/categoria-producto/${category}/page/1/`;
    const browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.goto(URL, {
      waitUntil: 'networkidle2',
    });
    const results = await page.evaluate(() => {
      const elementPagination = document.querySelectorAll('.pagination > .pagination-list ')[3];
      const numberOfPage = elementPagination.querySelector('a.page-numbers')?.textContent;
      return parseInt(numberOfPage);
    });
    await browser.close();
    return results;
  }

  async scrapperVyddistribuidores(): Promise<void> {
    try {
      const numberOfPage = await this.getTotalPageByCategory();

      for (let i = 0; i < numberOfPage; i++) {
        await this.registerDataOfVyDdistribuidores(i);
      }
    } catch (error) {
      this.logger.error('Error in Scrapper vyddistribuidores');
      this.logger.error(error);
      throw new Error('Error Scrapping vyddistribuidores Mangas');
    }
  }

  async registerDataOfVyDdistribuidores(location: string | number = '1'): Promise<void> {
    try {
      const listCreateNewBook: Promise<Book>[] = [];
      const listBooks = await this.getDataViaPuppeteer(location);
      for (const book of listBooks) {
        listCreateNewBook.push(this.bookService.createNewBookService(book));
      }
      const result = Promise.all(listCreateNewBook);
      this.logger.log({ message: 'Register Data Of vyddistribuidores', data: result });
    } catch (error) {
      this.logger.error('Error registering data');
      this.logger.error(error);
    }
  }
}
