import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { patchBodyAndHeaders } from './utils.proxy-helper';

@ApiTags('인증 프록시')
@Controller('api/auth')
export class AuthProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) { }

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '유저/스태프 로그인 (type: user | staff 필수)' })
  @ApiResponse({ status: 201, description: '로그인 성공' })
  async login(@Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('AUTH_SERVER_URL') + '/auth/login';
    if (!body.type) throw new Error('type 필드(user | staff)가 필요합니다');
    return this.proxyService.proxyRequest('POST', targetUrl, headers, body);
  }

  @Post('users/register')
  @ApiOperation({ summary: '유저 회원가입', description: '유저 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async userRegister(@Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('AUTH_SERVER_URL') + '/users/register';
    const jwtSecret = this.configService.get('JWT_SECRET');
    const { patchedBody, patchedHeaders } = patchBodyAndHeaders({
      body,
      headers,
      jwtSecret,
    });
    return this.proxyService.proxyRequest('POST', targetUrl, patchedHeaders, patchedBody);
  }

  @Post('staffs/register')
  @ApiOperation({ summary: '스태프 회원가입', description: '스태프 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async staffRegister(@Body() body, @Headers() headers) {
    const targetUrl = this.configService.get('AUTH_SERVER_URL') + '/staffs/register';
    const jwtSecret = this.configService.get('JWT_SECRET');
    const { patchedBody, patchedHeaders } = patchBodyAndHeaders({
      body,
      headers,
      jwtSecret,
      requireStaffId: true,
    });
    return this.proxyService.proxyRequest('POST', targetUrl, patchedHeaders, patchedBody);
  }
}