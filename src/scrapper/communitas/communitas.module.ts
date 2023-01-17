import { Module } from '@nestjs/common';
import { CommunitasService } from './communitas.service';
import { BookModule } from '../../database';

@Module({
  imports: [BookModule],
  providers: [CommunitasService],
  exports: [CommunitasService],
})
export class CommunitasModule {}
