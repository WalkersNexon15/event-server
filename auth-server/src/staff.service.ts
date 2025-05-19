import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument, StaffRole } from './staff.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) {}

  async createStaff(staff_id: string, password: string, roles: StaffRole[]): Promise<Staff> {
    const exists = await this.staffModel.findOne({ staff_id });
    if (exists) throw new ConflictException('이미 존재하는 staff_id입니다.');
    const hash = await bcrypt.hash(password, 10);
    const staff = new this.staffModel({ staff_id, password: hash, roles });
    return staff.save();
  }

  async findByStaffId(staff_id: string): Promise<Staff | null> {
    return this.staffModel.findOne({ staff_id });
  }

  async validatePassword(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }
} 