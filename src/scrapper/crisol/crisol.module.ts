import { Module } from '@nestjs/common';
import { CrisolService } from './crisol.service';
import { BookModule } from '../../database';

@Module({
  imports: [BookModule],
  providers: [CrisolService],
  exports: [CrisolService],
})
export class CrisolModule {}
