import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class LoginDto {
  identifier: string; // user_id 또는 staff_id
  password: string;
  type: 'user' | 'staff';
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identifier, dto.password, dto.type);
  }
} 