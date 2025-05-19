import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';

describe('RewardRequestController', () => {
  let controller: RewardRequestController;
  let service: RewardRequestService;

  const mockService = {
    createRequest: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardRequestController],
      providers: [
        { provide: RewardRequestService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<RewardRequestController>(RewardRequestController);
    service = module.get<RewardRequestService>(RewardRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /rewards/requests - requestReward', async () => {
    mockService.createRequest.mockResolvedValue({ status: 'SUCCESS' });
    const result = await controller.requestReward('event1', 'user1', { days: 3 });
    expect(service.createRequest).toHaveBeenCalledWith('event1', 'user1', { days: 3 });
    expect(result.status).toBe('SUCCESS');
  });

  it('GET /rewards/requests/me - myRequests', async () => {
    mockService.findByUser.mockResolvedValue([{ eventId: 'e1' }]);
    const result = await controller.myRequests('user1');
    expect(service.findByUser).toHaveBeenCalledWith('user1');
    expect(result).toEqual([{ eventId: 'e1' }]);
  });

  it('GET /rewards/requests - allRequests', async () => {
    mockService.findAll.mockResolvedValue([{ eventId: 'e1' }, { eventId: 'e2' }]);
    const result = await controller.allRequests();
    expect(service.findAll).toHaveBeenCalled();
    expect(result.length).toBe(2);
  });

  it('PATCH /rewards/requests/:id - updateStatus', async () => {
    mockService.updateStatus.mockResolvedValue({ status: 'SUCCESS' });
    const result = await controller.updateStatus('req1', 'SUCCESS', 'ok');
    if (result) {
      expect(service.updateStatus).toHaveBeenCalledWith('req1', 'SUCCESS', 'ok');
      expect(result.status).toBe('SUCCESS');
    } else {
      fail('result is null');
    }
  });

  it('인증/권한 검증은 Event Server의 책임이 아님을 명확히 한다', async () => {
    mockService.createRequest.mockResolvedValue({ status: 'SUCCESS' });
    const result = await controller.requestReward('event1', 'user1', { days: 3 });
    expect(service.createRequest).toHaveBeenCalledWith('event1', 'user1', { days: 3 });
  });
}); 