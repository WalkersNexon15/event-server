import { Body, Controller, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';

@Controller('rewards/requests')
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) { }

  // 유저가 보상 요청
  @Post()
  async requestReward(@Body('eventId') eventId: string, @Body('userId') userId: string, @Body('requestData') requestData?: any) {
    return this.rewardRequestService.createRequest(eventId, userId, requestData);
  }

  // 본인 요청 이력 조회
  @Get('me')
  async myRequests(@Query('userId') userId: string) {
    return this.rewardRequestService.findByUser(userId);
  }

  // 전체 요청 이력 조회 (운영자/감사/관리자)
  @Get()
  async allRequests() {
    return this.rewardRequestService.findAll();
  }

  // 상태 변경 (운영자/관리자)
  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body('status') status: 'SUCCESS' | 'FAILED', @Body('resultMessage') resultMessage?: string) {
    return this.rewardRequestService.updateStatus(id, status, resultMessage);
  }
} 