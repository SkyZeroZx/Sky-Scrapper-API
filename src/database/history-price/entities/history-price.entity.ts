import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema()
export class HistoryPrice extends Document {
  @Prop({
    unique: false,
    index: true,
  })
  isbn: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  registerDate: Date;

  @Prop()
  price: number;
}

export const HistoryPriceSchema = SchemaFactory.createForClass(HistoryPrice);
HistoryPriceSchema.index({ registerDate: 1 }, { expireAfterSeconds: 2592000 });
