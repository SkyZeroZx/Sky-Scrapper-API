import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  SCRAPPER_HOUR_INIT,
  NOTIFICATION_LIST_WISH,
  SCRAPPER_INIT,
  SCRAPPER_HOUR_NOTIFICATION,
  SCRAPPER_MINUTE_INIT,
} from '@core/constants';
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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScheduleService implements OnModuleInit {
  private readonly initHour = this.configService.get(SCRAPPER_HOUR_INIT);
  private readonly initMinute = this.configService.get(SCRAPPER_MINUTE_INIT);
  private readonly isProduction = this.configService.get(SCRAPPER_INIT);
  private readonly notificationHour = this.configService.get(SCRAPPER_HOUR_NOTIFICATION);

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
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing ScheduleService saved cronJobs');
    if (this.isProduction == 'true') {
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
    const registerSyncJob = new CronJob(`10 ${this.notificationHour} * * *`, async () => {
      await this.priceVariance();
    });
    this.schedulerRegistry.addCronJob('remeberNotification', registerSyncJob);
    registerSyncJob.start();
  }

  async registerHistoryPrice() {
    const hourRegisterPrice = parseInt(this.initHour) + 5;
    const jobHistoryPrice = new CronJob(`00 ${hourRegisterPrice} * * *`, async () => {
      this.logger.log('Init history price job')
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
    const initHour = parseInt(this.initHour);
    const jobCrisol = new CronJob(`${this.initMinute} ${initHour} * * *`, async () => {
      this.logger.log('Init Crisol Job');
      await this.crisolService.scrapperCrisol();
      this.logger.log('Finalized crisol Job');
    });
    this.schedulerRegistry.addCronJob(CrisolService.name, jobCrisol);
    jobCrisol.start();
  }

  registerCronIbero() {
    const initHour = parseInt(this.initHour) + 1;
    const jobIbero = new CronJob(`${this.initMinute} ${initHour} * * *`, async () => {
      this.logger.log('Init Ibero Job');
      await this.iberoService.scrapperIbero();
    });
    this.schedulerRegistry.addCronJob(IberoService.name, jobIbero);
    jobIbero.start();
  }

  registerCronJobVyddistribuidores() {
    const initHour = parseInt(this.initHour) + 2;
    const jobVyddistribuidores = new CronJob(`${this.initMinute} ${initHour} * * *`, async () => {
      this.logger.log('Init Vyddistribuidores Job');
      await this.vyddistribuidoresService.scrapperVyddistribuidores();
    });
    this.schedulerRegistry.addCronJob(VyddistribuidoresService.name, jobVyddistribuidores);
    jobVyddistribuidores.start();
  }

  registerCronCommunitas() {
    const initHour = parseInt(this.initHour) + 3;
    const jobCommunitas = new CronJob(`${this.initMinute} ${initHour} * * *`, async () => {
      await this.communitasService.scrapperCommunitas();
    });
    this.schedulerRegistry.addCronJob(CommunitasService.name, jobCommunitas);
    jobCommunitas.start();
  }

  async cleanPriceNull() {
    const initHour = parseInt(this.initHour) + 4;
    const jobCleanPriceNull = new CronJob(`${this.initMinute} ${initHour} * * *`, async () => {
      this.logger.log('Init Clean Price Null Job');
      await this.bookDetailService.clearPriceNull();
    });
    this.schedulerRegistry.addCronJob('clean-price-null', jobCleanPriceNull);
    jobCleanPriceNull.start();
  }
}
