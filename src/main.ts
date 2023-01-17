import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';
import helmet from 'helmet';
import { loggerConfig, webpush } from '@core/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, loggerConfig);
  const logger = new Logger(bootstrap.name);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cors());
  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  
  await app.listen(process.env.PORT || 3000);
  webpush();
 
  logger.log(`Server Listening : ${await app.getUrl()}`);
}

bootstrap();
