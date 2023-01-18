import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import UserAgent from 'user-agents';
import { puppeteerLaunchOptions, userAgentOptions } from '@core/config';
import { BLOCK_RESOURCE_TYPE, BLOCK_SOURCE_NAME, PUPPETEER_TIMEOUT } from '@core/constants';
import { IBook } from '@core/interface';
import { Book, BookService } from '../../database';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VyddistribuidoresService {
  private readonly logger = new Logger(VyddistribuidoresService.name);
  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

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
      timeout: this.configService.get<number>(PUPPETEER_TIMEOUT),
      waitUntil: 'networkidle2',
    });

    const results = await page.evaluate(() => {
      const listBook: IBook[] = [];

      document.querySelectorAll('li.product  > div.product-inner').forEach((z) => {
        const parent = 'a >';
        const shop = 'Vyddistribuidores';
        let originalPrice = z
          .querySelector(`${parent} .product-price-box > .price > .woocommerce-Price-amount > bdi `)
          ?.textContent.substring(2);
        const elementDiscontPrice = `${parent}  .product-price-box > .price > ins > span > bdi`;
        // In case originalPrice have a discount price
        if (!originalPrice) {
          originalPrice = z.querySelector(elementDiscontPrice)?.textContent.substring(2);
        }

        const book: IBook = {
          title: z.querySelector(`${parent} div.product-price-box > h2`)?.textContent.trim(),
          price: +originalPrice,
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
      this.logger.error({
        message: 'Error registering data',
        page: { message: `Error in page ${location}` },
      });
    }
  }

  async registerDataOfVyDdistribuidores(location: string | number = '1'): Promise<void> {
    try {
      const listCreateNewBook: Promise<Book>[] = [];
      const listBooks = await this.getDataViaPuppeteer(location);
      for (const book of listBooks) {
        listCreateNewBook.push(this.bookService.createNewBookService(book));
      }
      await Promise.all(listCreateNewBook);
      this.logger.log({ message: 'Register Data Of vyddistribuidores', data: listBooks });
    } catch (error) {
      this.logger.error('Error registering data');
      this.logger.error(error);
    }
  }
}
