import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { BookDetail } from '../../book-detail/entities/book-detail.entity';

// const decimalOptionalField = {
//   default: 0,
//   type: Types.Decimal128,
//   get: (v: Types.Decimal128) => v.toString(),
// };

@Schema()
export class Book extends Document {
  // id: string // Mongo me lo da
  @Prop({
    unique: false,
    index: true,
  })
  isbn: string;

  // @Prop({ type: decimalOptionalField })
  // price: number;

  // @Prop({})
  // author: string;

  // @Prop({})
  // editorial: string;

  // @Prop({})
  // category: string;

  @Prop({})
  image: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BookDetail.name }],
    default : []
  })
  @Type(() => BookDetail)
  bookDetail: BookDetail;

  // @Prop({})
  // isAvailable: string;

  // @Prop({})
  // linkProduct: string;

  // @Prop({ required: true })
  // shop: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
