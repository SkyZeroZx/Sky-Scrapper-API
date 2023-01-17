import { Module } from '@nestjs/common';
import { VyddistribuidoresService } from './vyddistribuidores.service';
import { BookModule } from '../../database';

@Module({
  imports : [BookModule],
  providers: [VyddistribuidoresService],
  exports: [VyddistribuidoresService]
})
export class VyddistribuidoresModule {}
