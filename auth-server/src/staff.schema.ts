import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StaffDocument = Staff & Document;

export enum StaffRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
}

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true, unique: true })
  staff_id: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: Object.values(StaffRole),
    required: true,
  })
  roles: StaffRole[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff); 