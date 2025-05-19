import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffRole } from './staff.schema';
import { AuthGuard } from '@nestjs/passport';

export class CreateStaffDto {
  staff_id: string;
  password: string;
  roles: StaffRole[];
}

@Controller('staffs')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  async register(@Body() dto: CreateStaffDto, @Request() req) {
    // ADMIN만 staff 생성 가능
    const staff = await this.staffService.createStaff(dto.staff_id, dto.password, dto.roles);
    return { id: staff['id'], staff_id: staff.staff_id, roles: staff.roles };
  }
} 