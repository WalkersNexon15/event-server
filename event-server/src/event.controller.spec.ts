import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from './event.schema';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockService = {
    createEvent: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('인증/권한 검증은 Event Server의 책임이 아님을 명확히 한다', async () => {
    mockService.createEvent.mockResolvedValue({ name: '이벤트' });
    const dto: Partial<Event> = { name: '이벤트', period: { start: new Date(), end: new Date() }, status: 'ACTIVE', condition: { type: 'attendance', params: { days: 3 } }, rewards: [], createdBy: 'user1' };
    await controller.create(dto, { body: { createdBy: 'user1' } });
    expect(service.createEvent).toHaveBeenCalledWith({ ...dto, createdBy: 'user1' });
  });

  it('createdBy 등 유저 정보는 컨트롤러에서 body에서 받아 서비스로 넘기고, 서비스는 비즈니스 로직만 처리함을 검증', async () => {
    mockService.createEvent.mockResolvedValue({ name: '이벤트' });
    const dto: Partial<Event> = { name: '이벤트', period: { start: new Date(), end: new Date() }, status: 'ACTIVE', condition: { type: 'attendance', params: { days: 3 } }, rewards: [], createdBy: 'user2' };
    await controller.create(dto, { body: { createdBy: 'user2' } });
    expect(service.createEvent).toHaveBeenCalledWith({ ...dto, createdBy: 'user2' });
  });
}); 