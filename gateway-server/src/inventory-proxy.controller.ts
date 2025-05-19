import { Controller, Get, Req, Headers } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('인벤토리 프록시')
@Controller('api/inventory')
export class InventoryProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) { }

  @Get('me')
  @ApiOperation({ summary: '내 인벤토리 조회', description: '유저만 자신의 인벤토리 조회 가능' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '내 인벤토리 조회 성공' })
  async myInventory(@Req() req, @Headers() headers) {
    const targetUrl = this.configService.get('EVENT_SERVER_URL') + '/inventory/me';
    return this.proxyService.proxyRequest(
      'GET',
      targetUrl,
      headers,
      undefined,
      ['USER'],
      this.configService.get('JWT_SECRET'),
      req.query,
    );
  }
} 