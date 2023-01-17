import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const decimalOptionalField = {
  default: 0,
  type: Types.Decimal128,
  //  get: (v: Types.Decimal128) => v.toString(),
};

@Schema()
export class BookDetail extends Document {
  // id: string // Mongo me lo da
  @Prop({
    unique: false,
    index: true,
  })
  isbn: string;

  @Prop({ collation: { locale: 'en', strength: 2 } })
  title: string;

  @Prop({ type: decimalOptionalField })
  price: number;

  @Prop({})
  author: string;

  @Prop({})
  editorial: string;

  @Prop({})
  category: string;

  @Prop({})
  image: string;

  @Prop()
  isAvailable: boolean;

  @Prop({})
  linkProduct: string;

  @Prop({ required: true })
  shop: string;
}

export const BookDetailSchema = SchemaFactory.createForClass(BookDetail);
BookDetailSchema.index({ title: 'text' });
