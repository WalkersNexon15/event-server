import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    default: ['USER'],
    required: true,
    enum: ['USER'],
  })
  roles: ['USER'];
}

export const UserSchema = SchemaFactory.createForClass(User); 