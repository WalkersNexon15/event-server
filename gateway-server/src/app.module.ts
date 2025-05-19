import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { ProxyModule } from './proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProxyModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
