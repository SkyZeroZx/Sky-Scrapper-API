import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { NOTIFICATION_LIST_WISH } from '@core/constants';
import { NotificationService } from '../notification/notification.service';
import { ListWishService } from '../list-wish/list-wish.service';
import { HistoryPriceService } from '../history-price/history-price.service';
import {
  CommunitasService,
  CrisolService,
  IberoService,
  VyddistribuidoresService,
} from '../../scrapper';
import { BookDetailService } from '../book-detail/book-detail.service';

@Injectable()
export class ScheduleService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationService: NotificationService,
    private readonly listWishService: ListWishService,
    private readonly historyPriceService: HistoryPriceService,
    private readonly communitasService: CommunitasService,
    private readonly crisolService: CrisolService,
    private readonly iberoService: IberoService,
    private readonly vyddistribuidoresService: VyddistribuidoresService,
    private readonly bookDetailService: BookDetailService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing ScheduleService saved cronJobs');
    if (process.env.IS_PRODUCTION == 'true') {
      this.logger.log('Is productions saved');
      this.initCronJobs();
    }
  }

  initCronJobs() {
    this.registerJobNotifications();
    this.registerCronCrisol();
    this.registerCronIbero();
    this.registerCronJobVyddistribuidores();
    this.cleanPriceNull();
    this.registerHistoryPrice();
  }

  registerJobNotifications() {
    const registerSyncJob = new CronJob('10 13 * * *', () => {
      this.priceVariance();
    });
    this.schedulerRegistry.addCronJob('remeberNotification', registerSyncJob);
    registerSyncJob.start();
  }

  async registerHistoryPrice() {
    const jobHistoryPrice = new CronJob('00 12 * * *', async () => {
      await this.historyPriceService.registerMinorPriceByIsbn();
    });
    this.schedulerRegistry.addCronJob(HistoryPriceService.name, jobHistoryPrice);
    jobHistoryPrice.start();
  }

  async priceVariance() {
    const listIsbnVariation = await this.historyPriceService.getVariationPriceIsbn();

    const listEmailUser = await this.listWishService.findEmailsByListIsbn(listIsbnVariation);

    const listTokens = await this.notificationService.findTokensByEmails(listEmailUser);

    for (const token of listTokens) {
      await this.notificationService.sendNotification(token, NOTIFICATION_LIST_WISH());
    }
  }

  registerCronCrisol() {
    const jobCrisol = new CronJob('15 06 * * *', async () => {
      this.logger.log('Init Crisol Job');
      await this.crisolService.scrapperCrisol();
      this.logger.log('Finalized crisol Job');
    });
    this.schedulerRegistry.addCronJob(CrisolService.name, jobCrisol);
    jobCrisol.start();
  }

  registerCronCommunitas() {
    const jobCommunitas = new CronJob('15 07 * * *', async () => {
      await this.communitasService.scrapperCommunitas();
    });
    this.schedulerRegistry.addCronJob(CommunitasService.name, jobCommunitas);
    jobCommunitas.start();
  }

  registerCronIbero() {
    const jobIbero = new CronJob('45 08 * * *', async () => {
      this.logger.log('Init Ibero Job');
      await this.iberoService.scrapperIbero();
    });
    this.schedulerRegistry.addCronJob(IberoService.name, jobIbero);
    jobIbero.start();
  }

  registerCronJobVyddistribuidores() {
    const jobVyddistribuidores = new CronJob('15 09 * * *', async () => {
      this.logger.log('Init Vyddistribuidores Job');
      await this.vyddistribuidoresService.scrapperVyddistribuidores();
    });
    this.schedulerRegistry.addCronJob(VyddistribuidoresService.name, jobVyddistribuidores);
    jobVyddistribuidores.start();
  }

  async cleanPriceNull() {
    const jobCleanPriceNull = new CronJob('00 10 * * *', async () => {
      this.logger.log('Init Clean Price Null Job');
      await this.bookDetailService.clearPriceNull();
    });
    this.schedulerRegistry.addCronJob('clean-price-null', jobCleanPriceNull);
    jobCleanPriceNull.start();
  }
}
