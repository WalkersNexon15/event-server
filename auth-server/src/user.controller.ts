import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

export class CreateUserDto {
  user_id: string;
  password: string;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto.user_id, dto.password);
    return { id: user['id'], user_id: user.user_id, roles: user.roles };
  }
} 