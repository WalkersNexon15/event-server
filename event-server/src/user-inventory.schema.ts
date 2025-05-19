import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserInventoryDocument = UserInventory & Document;

export class InventoryItem {
  @Prop({ required: true })
  type: string; // 'item' | 'point' | 'coupon'
  @Prop()
  itemName?: string;
  @Prop()
  amount?: number;
  @Prop()
  couponCode?: string;
}

@Schema({ timestamps: true })
export class UserInventory {
  @Prop({ required: true, unique: true })
  userId: string;
  @Prop({ type: [InventoryItem], default: [] })
  items: InventoryItem[];
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory); 