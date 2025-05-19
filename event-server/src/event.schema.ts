import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

export type ConditionType = 'attendance' | 'invite' | 'quest';

export class Condition {
  @Prop({ required: true })
  type: ConditionType;
  @Prop({ type: Object, required: true })
  params: Record<string, any>;
}

export class Reward {
  @Prop({ required: true })
  type: string; // 'point' | 'item' | 'coupon' 등
  @Prop()
  amount?: number;
  @Prop()
  itemName?: string;
  @Prop()
  couponCode?: string;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  name: string;
  @Prop()
  description?: string;
  @Prop({
    type: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    required: true,
  })
  period: { start: Date; end: Date };
  @Prop({ required: true, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE';
  @Prop({ type: Condition, required: true })
  condition: Condition;
  @Prop({ type: [Reward], required: true })
  rewards: Reward[];
  @Prop({ type: String, required: true })
  createdBy: string; // user_id
}

export const EventSchema = SchemaFactory.createForClass(Event); 