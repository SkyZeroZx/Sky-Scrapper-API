 
import { PageMetaDtoParameters } from './page-meta-dto-parameters.interface';
 

export class PageMetaDto {
 // @ApiProperty()
  readonly page: number;

 // @ApiProperty()
  readonly take: number;

  //@ApiProperty()
  readonly itemCount: number;

  //@ApiProperty()
  readonly pageCount: number;

  //@ApiProperty()
  readonly hasPreviousPage: boolean;

 // @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount || 0 ;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
