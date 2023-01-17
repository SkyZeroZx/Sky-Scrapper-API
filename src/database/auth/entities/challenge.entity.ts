import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Challenge {
  @Prop({
    unique: true,
    index: true,
  })
  userEmail: string;

  @Prop({})
  currentChallenge: string;
}
export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
