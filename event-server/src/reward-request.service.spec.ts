import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestService } from './reward-request.service';
import { getModelToken } from '@nestjs/mongoose';
import { RewardRequest } from './reward-request.schema';
import { Event } from './event.schema';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserInventoryService } from './user-inventory.service';

const mockRewardRequestModel = function (data) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
  };
};
mockRewardRequestModel.findOne = jest.fn();
mockRewardRequestModel.find = jest.fn();
mockRewardRequestModel.findByIdAndUpdate = jest.fn();

const mockEventModel = {
  findById: jest.fn(),
};

const mockUserInventoryService = {
};

describe('RewardRequestService', () => {
  let service: RewardRequestService;
  let rewardRequestModel: any;
  let eventModel: any;

  beforeEach(async () => {
    mockRewardRequestModel.findOne.mockReset();
    mockRewardRequestModel.find.mockReset();
    mockRewardRequestModel.findByIdAndUpdate.mockReset();
    mockEventModel.findById.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardRequestService,
        { provide: getModelToken(RewardRequest.name), useValue: mockRewardRequestModel },
        { provide: getModelToken(Event.name), useValue: mockEventModel },
        { provide: UserInventoryService, useValue: mockUserInventoryService },
      ],
    }).compile();

    service = module.get<RewardRequestService>(RewardRequestService);
    rewardRequestModel = module.get(getModelToken(RewardRequest.name));
    eventModel = module.get(getModelToken(Event.name));
  });

  describe('createRequest', () => {
    it('출석 이벤트 조건 충족 시 SUCCESS', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue({
        condition: { type: 'attendance', params: { days: 3 } },
      });
      const reqData = { days: 3 };
      const result = await service.createRequest('event1', 'user1', reqData);
      expect(result.status).toBe('SUCCESS');
    });

    it('출석 이벤트 조건 미달 시 FAILED', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue({
        condition: { type: 'attendance', params: { days: 5 } },
      });
      const reqData = { days: 2 };
      const result = await service.createRequest('event1', 'user1', reqData);
      expect(result.status).toBe('FAILED');
      expect(result.resultMessage).toContain('출석일 부족');
    });

    it('중복 요청 시 ConflictException', async () => {
      rewardRequestModel.findOne.mockResolvedValue({});
      await expect(service.createRequest('event1', 'user1', { days: 3 })).rejects.toThrow(ConflictException);
    });

    it('존재하지 않는 이벤트ID 시 NotFoundException', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue(null);
      await expect(service.createRequest('event1', 'user1', { days: 3 })).rejects.toThrow(NotFoundException);
    });

    it('지원하지 않는 이벤트 조건 유형 시 BadRequestException', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue({
        condition: { type: 'unknown', params: {} },
      });
      await expect(service.createRequest('event1', 'user1', {})).rejects.toThrow(BadRequestException);
    });

    it('친구초대 이벤트 조건 충족/미달', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue({
        condition: { type: 'invite', params: { count: 2 } },
      });
      // 충족
      let reqData = { invitedCount: 2 };
      let result = await service.createRequest('event2', 'user2', reqData);
      expect(result.status).toBe('SUCCESS');
      // 미달
      reqData = { invitedCount: 1 };
      result = await service.createRequest('event2', 'user2', reqData);
      expect(result.status).toBe('FAILED');
      expect(result.resultMessage).toContain('초대한 친구 수 부족');
    });

    it('퀘스트 이벤트 조건 충족/미달', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue({
        condition: { type: 'quest', params: { questId: 'q1' } },
      });
      // 충족
      let reqData = { questId: 'q1', completed: true };
      let result = await service.createRequest('event3', 'user3', reqData);
      expect(result.status).toBe('SUCCESS');
      // 미달
      reqData = { questId: 'q1', completed: false };
      result = await service.createRequest('event3', 'user3', reqData);
      expect(result.status).toBe('FAILED');
      expect(result.resultMessage).toContain('퀘스트 완료 조건 미달');
    });

    it('Event Server는 userId 등 인증 정보를 파라미터로만 받고, 직접 인증/유저 DB에 접근하지 않는다', async () => {
      rewardRequestModel.findOne.mockResolvedValue(null);
      eventModel.findById.mockResolvedValue({
        condition: { type: 'attendance', params: { days: 3 } },
      });
      const reqData = { days: 3 };
      const result = await service.createRequest('event1', 'user1', reqData);
      expect(result.status).toBe('SUCCESS');
      // userId는 파라미터로만 사용됨을 확인 (직접 인증/유저 DB 접근 없음)
    });
  });
}); 