import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { EventsProxyController } from './events-proxy.controller';
import { RewardsProxyController } from './rewards-proxy.controller';
import { InventoryProxyController } from './inventory-proxy.controller';
import { AuthProxyController } from './auth-proxy.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ProxyService],
  controllers: [
    EventsProxyController,
    RewardsProxyController,
    InventoryProxyController,
    AuthProxyController,
  ],
  exports: [ProxyService],
})
export class ProxyModule {} 