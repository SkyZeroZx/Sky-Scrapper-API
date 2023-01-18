import { Injectable, Logger } from '@nestjs/common';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer';
import { BLOCK_RESOURCE_TYPE, BLOCK_SOURCE_NAME, PUPPETEER_TIMEOUT } from '@core/constants';
import { puppeteerLaunchOptions, userAgentOptions } from '@core/config';
import { IBook } from '@core/interface';
import { Book, BookService } from '../../database';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IberoService {
  private readonly logger = new Logger(IberoService.name);
  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

  async getDataViaPuppeteer(location: string | number = '1') {
    const URL = `https://www.iberolibrerias.com/comics-y-mangas?page=${location}`;
    const userAgent = new UserAgent(userAgentOptions).toString();

    const browser = await puppeteer.launch(puppeteerLaunchOptions);

    const page = await browser.newPage();
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

    await page.setUserAgent(userAgent);

    await page.goto(URL, {
      timeout: this.configService.get<number>(PUPPETEER_TIMEOUT),
      waitUntil: 'networkidle2',
    });

    const results = await page.evaluate(() => {
      const listBooks: IBook[] = [];

      document.querySelectorAll('article.vtex-product-summary-2-x-element').forEach((z) => {
        const parent1 = 'div.vtex-flex-layout-0-x-flexRow >';
        const parent2 = 'div.vtex-flex-layout-0-x-flexRowContent--product-summary-card-block1 >';
        const parent3 = 'div.vtex-flex-layout-0-x-stretchChildrenWidth >';
        const parent4 =
          'div.vtex-product-summary-2-x-nameContainer  > h3 > span.vtex-product-summary-2-x-productBrand';
        const parentToAuthor =
          'iberoperu-iberoperu-apps-5-x-enovasdescriptiondatadescriptioncontainer iberoperu-iberoperu-apps-5-x-enovasdescriptiondatadescriptioncontainer--product-author-ctn-detail';
        const classButtonCart = 'vtex-add-to-cart-button-0-x-buttonText';
        const classPrice = 'vtex-product-price-1-x-currencyInteger--summary-price-list-offert';
        const classImg = 'vtex-product-summary-2-x-imageNormal';
        const totalParentToTile = parent1 + parent2 + parent3 + parent4;
        const shop = 'Ibero';
        const category = 'Manga';
        const book: IBook = {
          title: z.querySelector(`${totalParentToTile}`)?.textContent.trim(),
          author: z.querySelector(`[class*='${parentToAuthor}']`)?.textContent.trim(),
          isAvailable: z.querySelector(`[class*='${classButtonCart}']`)?.textContent === 'Comprar',
          price: +z.querySelector(`[class*='${classPrice}']`)?.textContent,
          linkProduct: z.querySelector('a')?.href,
          image: z.querySelector(`[class*='${classImg}']`)?.['src'],
          isbn: z.querySelector('a')?.href.slice(-22).substring(0, 13),
          category,
          editorial: null,
          shop,
        };

        listBooks.push(book);
      });

      return listBooks;
    });

    await browser.close();
    return results;
  }

  async scrapperIbero(): Promise<void> {
    try {
      let i: number = 1;
      while (i < 51) {
        await this.registerDataOfIbero(i);
        i++;
      }
    } catch (error) {
      this.logger.error('Error in Scrapper Ibero');
      this.logger.error(error);
      throw new Error('Error Scrapping Ibero Mangas');
    }
  }

  async registerDataOfIbero(location: string | number = '1'): Promise<void> {
    try {
      const listCreateNewBook: Promise<Book>[] = [];
      const listBooks = await this.getDataViaPuppeteer(location);
      for (const book of listBooks) {
        listCreateNewBook.push(this.bookService.createNewBookService(book));
      }
      await Promise.all(listCreateNewBook);
      this.logger.log({ message: 'Register Data Of Ibero', data: listBooks });
    } catch (error) {
      this.logger.error({
        message: 'Error registering data',
        page: { message: `Error in page ${location}` },
      });
      this.logger.error(error);
    }
  }

  async getTotalPageByCategory(category: string = 'comics-y-mangas'): Promise<number> {
    const URL = `https://www.iberolibrerias.com/${category}?page=1`;
    const browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.goto(URL, {
      waitUntil: 'networkidle2',
    });
    const results = await page.evaluate(() => {
      const elementPagination = document.querySelector(
        'div.vtex-search-result-3-x-totalProducts--layout',
      );
      const numberOfPage = elementPagination.querySelector('span')?.textContent;
      return parseInt(numberOfPage);
    });
    await browser.close();
    // Items peer page is 20 by default
    const totalPages = Math.ceil(results / 20);
    return totalPages;
  }
}
