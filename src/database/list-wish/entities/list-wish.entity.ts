import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ListWish extends Document {
  @Prop({
    unique: false,
    index: true,
  })
  isbn: string;
  
  @Prop()
  userEmail: string;
}

export const ListWishSchema = SchemaFactory.createForClass(ListWish);
