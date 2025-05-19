import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true })
export class RewardRequest {
  @Prop({ required: true })
  eventId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' })
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  @Prop()
  resultMessage?: string;
  @Prop({ type: Object })
  requestData?: Record<string, any>; // 유저 행동 등 추가 정보
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest); 