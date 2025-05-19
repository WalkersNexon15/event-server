import { Injectable, ConflictException, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RewardRequest, RewardRequestDocument } from './reward-request.schema';
import { Event, EventDocument } from './event.schema';
import { UserInventoryService } from './user-inventory.service';

@Injectable()
export class RewardRequestService {
  constructor(
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly userInventoryService: UserInventoryService,
  ) { }

  async createRequest(eventId: string, userId: string, requestData?: Record<string, any>): Promise<RewardRequest> {
    // 중복 요청 방지: 동일 이벤트/유저에 대해 SUCCESS/PENDING이 있으면 예외
    const exists = await this.rewardRequestModel.findOne({ eventId, userId, status: { $in: ['PENDING', 'SUCCESS'] } });
    if (exists) throw new ConflictException('이미 요청된 이벤트입니다.');

    // 이벤트 정보 조회
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('이벤트를 찾을 수 없습니다.');

    // 조건 검증
    const { type, params } = event.condition;
    let isValid = false;
    let failReason = '';
    if (type === 'attendance') {
      // 예시: requestData.days >= params.days
      if (requestData?.days >= params.days) isValid = true;
      else failReason = `출석일 부족: ${requestData?.days ?? 0} / ${params.days}`;
    } else if (type === 'invite') {
      if (requestData?.invitedCount >= params.count) isValid = true;
      else failReason = `초대한 친구 수 부족: ${requestData?.invitedCount ?? 0} / ${params.count}`;
    } else if (type === 'quest') {
      if (requestData?.questId === params.questId && requestData?.completed) isValid = true;
      else failReason = '퀘스트 완료 조건 미달';
    } else {
      throw new BadRequestException('지원하지 않는 이벤트 조건 유형입니다.');
    }

    const status = isValid ? 'SUCCESS' : 'FAILED';
    const resultMessage = isValid ? '조건 충족' : failReason;
    const req = new this.rewardRequestModel({ eventId, userId, requestData, status, resultMessage });
    const saved = await req.save();

    // 보상 지급 성공 시 인벤토리에 추가
    if (isValid && event.rewards && event.rewards.length > 0) {
      for (const reward of event.rewards) {
        await this.userInventoryService.addReward(userId, reward);
      }
    }

    return saved;
  }

  async findByUser(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestModel.find({ userId }).exec();
  }

  async findAll(): Promise<RewardRequest[]> {
    return this.rewardRequestModel.find().exec();
  }

  async updateStatus(id: string, status: 'SUCCESS' | 'FAILED', resultMessage?: string): Promise<RewardRequest | null> {
    return this.rewardRequestModel.findByIdAndUpdate(id, { status, resultMessage }, { new: true }).exec();
  }
} 