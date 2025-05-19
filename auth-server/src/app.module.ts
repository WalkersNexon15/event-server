import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Staff, StaffSchema, StaffRole } from './staff.schema';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { Reflector } from '@nestjs/core';

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
      { name: User.name, schema: UserSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController, StaffController, AuthController],
  providers: [AppService, UserService, StaffService, AuthService, JwtStrategy, Reflector],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly staffService: StaffService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    // 최초 ADMIN 계정 시드
    const adminId = this.configService.get<string>('ADMIN_USER_ID');
    const adminPw = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminId || !adminPw) {
      console.log('[시드] ADMIN_USER_ID 또는 ADMIN_PASSWORD 환경변수가 없어 최초 ADMIN 계정을 생성하지 않습니다.');
      return;
    }
    const exists = await this.staffService.findByStaffId(adminId);
    if (!exists) {
      await this.staffService.createStaff(adminId, adminPw, [StaffRole.ADMIN]);
      console.log(`[시드] 최초 ADMIN 계정 생성: ${adminId}`);
    }
  }
}
