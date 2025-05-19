import { Controller, Get, Query } from '@nestjs/common';
import { UserInventoryService } from './user-inventory.service';

@Controller('inventory')
export class UserInventoryController {
  constructor(private readonly inventoryService: UserInventoryService) { }

  @Get('me')
  async myInventory(@Query('userId') userId: string) {
    return this.inventoryService.getInventory(userId);
  }
} 