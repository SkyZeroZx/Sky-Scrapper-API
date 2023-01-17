// import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  // @ApiProperty()

  //@ApiProperty()
  @MinLength(6)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(120)
  @IsNotEmpty()
  lastName: string;
}
