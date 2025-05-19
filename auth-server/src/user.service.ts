import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(user_id: string, password: string): Promise<User> {
    const exists = await this.userModel.findOne({ user_id });
    if (exists) throw new ConflictException('이미 존재하는 user_id입니다.');
    const hash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ user_id, password: hash });
    return user.save();
  }

  async findByUserId(user_id: string): Promise<User | null> {
    return this.userModel.findOne({ user_id });
  }

  async validatePassword(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }
} 