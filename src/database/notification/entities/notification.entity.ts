import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notification extends Document {
  @Prop({
    unique: false,
    index: false,
  })
  tokenPush: string;

  @Prop()
  userEmail: string;
}

export const Notificationchema = SchemaFactory.createForClass(Notification);
