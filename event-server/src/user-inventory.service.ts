import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInventory, UserInventoryDocument } from './user-inventory.schema';

@Injectable()
export class UserInventoryService {
  constructor(
    @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventoryDocument>,
  ) { }

  async addReward(userId: string, reward: any) {
    console.log('addReward', userId, reward);
    // reward: { type, itemName, amount, couponCode }
    const inv = await this.inventoryModel.findOne({ userId });
    if (!inv) {
      return this.inventoryModel.create({ userId, items: [reward] });
    }
    // 동일 아이템이면 수량 증가, 아니면 추가
    const idx = inv.items.findIndex(
      (i) => i.type === reward.type && i.itemName === reward.itemName && i.couponCode === reward.couponCode
    );
    if (idx >= 0 && reward.amount) {
      inv.items[idx].amount = (inv.items[idx].amount || 0) + reward.amount;
    } else {
      inv.items.push(reward);
    }
    return inv.save();
  }

  async getInventory(userId: string) {
    return this.inventoryModel.findOne({ userId });
  }
} 