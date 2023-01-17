import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ScheduleModule as ScheduleModuleNestJs } from '@nestjs/schedule';
import { HttpLoggingInterceptor } from '@core/interceptor';
import { metricsPrometheus } from '@core/metrics';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BookModule,
  BookDetailModule,
  AuthModule,
  UserModule,
  ListWishModule,
  NotificationModule,
  HistoryPriceModule,
  ScheduleModule,
} from './database';
import { CommunitasModule, CrisolModule, IberoModule, VyddistribuidoresModule } from './scrapper';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrometheusModule.register(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const host = configService.get('MONGO_HOST');

        return {
          uri: `mongodb+srv://${username}:${password}@${host}`,
          dbName: database,
        };
      },
    }),
    ScheduleModuleNestJs.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', process.env.STATIC_SERVER_PATH),
      serveRoot: `/${process.env.STATIC_SERVER_PATH}`,
      serveStaticOptions: {
        cacheControl: true,
        setHeaders: (res, path, stat) => {
          res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        },
      },
    }),
    CommunitasModule,
    IberoModule,
    CrisolModule,
    VyddistribuidoresModule,
    BookModule,
    BookDetailModule,
    AuthModule,
    UserModule,
    ListWishModule,
    NotificationModule,
    HistoryPriceModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...metricsPrometheus],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingInterceptor)
      .exclude(
        { path: 'metrics', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
