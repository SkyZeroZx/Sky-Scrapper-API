import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ROLES_USER } from '@core/constants/role';
import { Auth, UserDecorator as User } from '@core/decorators';
import { User as UserEntity } from '../user/entities/user.entity';
import { AddItemListWishDto } from './dtos/add-item-list-wish.dto';
import { ListWishService } from './list-wish.service';

@Controller('list-wish')
export class ListWishController {
  constructor(private readonly listWishService: ListWishService) {}

  @Auth(ROLES_USER.USER)
  @Post()
  addItemListWish(@Body() addItemListWish: AddItemListWishDto, @User() user: UserEntity) {
    return this.listWishService.addItemListWish(addItemListWish, user);
  }

  @Auth(ROLES_USER.USER)
  @Get()
  getListWish(@User() user: UserEntity) {
    return this.listWishService.findListWish(user);
  }

  @Auth(ROLES_USER.USER)
  @Get(':isbn')
  isWish(@Param('isbn') isbn: string, @User() user: UserEntity) {
    return this.listWishService.isWish(user, isbn);
  }

  @Auth(ROLES_USER.USER)
  @Delete(':isbn')
  removeItemListWish(@Param('isbn') isbn: string, @User() user: UserEntity) {
    return this.listWishService.removeItemListWish(isbn, user);
  }
}
