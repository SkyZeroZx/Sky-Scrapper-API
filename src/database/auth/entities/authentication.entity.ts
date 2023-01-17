import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
@Schema()
export class Authentication {
  @Prop({
    unique: true,
    index: true,
  })
  idAuthentication: string;

  @Prop({
    unique: false,
    index: true,
  })
  userEmail: string;

  @Prop({
    type: mongoose.Types.Buffer,
    default: [], 
  })
  // SQL: Encode to base64url then store as `TEXT`. Index this column
  credentialID: Buffer;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...

  @Prop({
    type: mongoose.Types.Buffer,
    default: [],
  })
  credentialPublicKey: Buffer;
}

export const AuthenticationSchema = SchemaFactory.createForClass(Authentication);
