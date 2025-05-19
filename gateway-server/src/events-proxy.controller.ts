import { Controller, Post, Get, Patch, Param, Body, Req, Headers, UseGuards } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { patchBodyAndHeaders } from './utils.proxy-helper';

@ApiTags('이벤트 프록시')
@Controller('api/events')
export class EventsProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) { }

  @Post()
  @ApiOperation({ summary: '이벤트 생성', description: '운영자/관리자만 이벤트 생성 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: '이벤트 생성 성공' })
  async createEvent(@Req() req, @Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + '/events';
    const jwtSecret = this.configService.get('JWT_SECRET');
    const { patchedBody, patchedHeaders } = patchBodyAndHeaders({
      body,
      headers,
      jwtSecret,
      requireStaffId: true,
    });
    return this.proxyService.proxyRequest('POST', targetUrl, patchedHeaders, patchedBody, ['OPERATOR', 'ADMIN'], jwtSecret);
  }

  @Get()
  @ApiOperation({ summary: '이벤트 목록 조회' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '이벤트 목록 조회 성공' })
  async getEvents(@Req() req, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + '/events';
    return this.proxyService.proxyRequest('GET', targetUrl, headers, undefined, undefined, this.configService.get('JWT_SECRET'));
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 상세 조회' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '이벤트 상세 조회 성공' })
  async getEventById(@Param('id') id: string, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + `/events/${id}`;
    return this.proxyService.proxyRequest('GET', targetUrl, headers, undefined, undefined, this.configService.get('JWT_SECRET'));
  }

  @Patch(':id')
  @ApiOperation({ summary: '이벤트 수정', description: '운영자/관리자만 이벤트 수정 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '이벤트 수정 성공' })
  async updateEvent(@Param('id') id: string, @Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + `/events/${id}`;
    return this.proxyService.proxyRequest('PATCH', targetUrl, headers, body, ['OPERATOR', 'ADMIN'], this.configService.get('JWT_SECRET'));
  }
} 