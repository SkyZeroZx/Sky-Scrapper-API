import { IsNotEmpty, IsString } from 'class-validator';

export class AddItemListWishDto {
  @IsString()
  @IsNotEmpty()
  isbn: string;
}
