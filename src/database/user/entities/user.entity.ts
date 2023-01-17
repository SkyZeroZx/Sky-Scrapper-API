import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { ROLES_USER } from '../../../core/constants/role';
import { USER_STATUS } from '../../../core/constants/user-status';
import { ListWish } from '../../list-wish/entities/list-wish.entity';
import { Notification } from '../../notification/entities/notification.entity';

@Schema()
export class User extends Document {
  // id: string // Mongo me lo da
  @Prop({
    unique: true,
    index: true,
  })
  email: string;

  @Prop({})
  firstName: string;

  @Prop({})
  lastName: string;

  @Prop({})
  @Exclude()
  password: string;

  @Prop({ default: ROLES_USER.USER })
  role: string;

  @Prop({ default: USER_STATUS.CREATED })
  status: string;

  @Prop({ default: '' })
  image: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: ListWish.name }],
    default: [],
  })
  @Type(() => ListWish)
  listWish: ListWish;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Notification.name }],
    default: [],
  })
  @Type(() => Notification)
  listToken: Notification;
}

export const UserSchema = SchemaFactory.createForClass(User);
