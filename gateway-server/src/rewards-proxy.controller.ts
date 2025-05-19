import { Controller, Post, Get, Patch, Param, Body, Req, Headers } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { patchBodyAndHeaders } from './utils.proxy-helper';

@ApiTags('보상 프록시')
@Controller('api/rewards/requests')
export class RewardsProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) { }

  @Post()
  @ApiOperation({ summary: '보상 요청', description: '유저만 보상 요청 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: '보상 요청 성공' })
  async requestReward(@Req() req, @Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + '/rewards/requests';
    const jwtSecret = this.configService.get('JWT_SECRET');
    const { patchedBody, patchedHeaders } = patchBodyAndHeaders({
      body,
      headers,
      jwtSecret,
      requireUserId: true,
    });
    return this.proxyService.proxyRequest('POST', targetUrl, patchedHeaders, patchedBody, ['USER'], jwtSecret);
  }

  @Get('me')
  @ApiOperation({ summary: '내 보상 이력 조회', description: '유저만 자신의 이력 조회 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '내 보상 이력 조회 성공' })
  async myRequests(@Req() req, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + '/rewards/requests/me';
    return this.proxyService.proxyRequest('GET', targetUrl, headers, undefined, ['USER'], this.configService.get('JWT_SECRET'));
  }

  @Get()
  @ApiOperation({ summary: '전체 보상 요청 이력 조회', description: '운영자/감사/관리자만 전체 이력 조회 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '전체 보상 요청 이력 조회 성공' })
  async allRequests(@Req() req, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + '/rewards/requests';
    return this.proxyService.proxyRequest('GET', targetUrl, headers, undefined, ['OPERATOR', 'AUDITOR', 'ADMIN'], this.configService.get('JWT_SECRET'));
  }

  @Patch(':id')
  @ApiOperation({ summary: '보상 상태 변경', description: '운영자/관리자만 상태 변경 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '보상 상태 변경 성공' })
  async updateStatus(@Param('id') id: string, @Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + `/rewards/requests/${id}`;
    return this.proxyService.proxyRequest('PATCH', targetUrl, headers, body, ['OPERATOR', 'ADMIN'], this.configService.get('JWT_SECRET'));
  }
} 