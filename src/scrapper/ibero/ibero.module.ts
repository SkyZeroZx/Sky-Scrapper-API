import { Module } from '@nestjs/common';
import { IberoService } from './ibero.service';
import { BookModule } from '../../database';

@Module({
  imports : [BookModule],
  providers: [IberoService],
  exports : [IberoService]
})
export class IberoModule {}
