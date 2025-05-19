import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { Event, EventSchema } from './event.schema';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestController } from './reward-request.controller';
import { UserInventory, UserInventorySchema } from './user-inventory.schema';
import { UserInventoryService } from './user-inventory.service';
import { UserInventoryController } from './user-inventory.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
      { name: UserInventory.name, schema: UserInventorySchema },
    ]),
  ],
  controllers: [EventController, RewardRequestController, UserInventoryController],
  providers: [AppService, EventService, RewardRequestService, UserInventoryService],
})
export class AppModule { }
