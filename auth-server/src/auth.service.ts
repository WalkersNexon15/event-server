import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { StaffService } from './staff.service';
import { User } from './user.schema';
import { Staff } from './staff.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
  ) { }

  async login(identifier: string, password: string, type: 'user' | 'staff') {
    if (type === 'user') {
      const user = await this.userService.findByUserId(identifier);
      if (!user) throw new UnauthorizedException('User not found');
      const isValid = await this.userService.validatePassword(password, user.password);
      if (!isValid) throw new UnauthorizedException('Invalid password');
      const payload = {
        sub: user['id'],
        user_id: user['user_id'],
        roles: user.roles,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user['id'],
          user_id: user['user_id'],
          roles: user.roles,
        },
      };
    } else if (type === 'staff') {
      const staff = await this.staffService.findByStaffId(identifier);
      if (!staff) throw new UnauthorizedException('Staff not found');
      const isValid = await this.staffService.validatePassword(password, staff.password);
      if (!isValid) throw new UnauthorizedException('Invalid password');
      const payload = {
        sub: staff['id'],
        staff_id: staff['staff_id'],
        roles: staff.roles,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: staff['id'],
          staff_id: staff['staff_id'],
          roles: staff.roles,
        },
      };
    } else {
      throw new UnauthorizedException('Invalid type');
    }
  }
} 