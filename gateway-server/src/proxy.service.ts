import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) { }

  async proxyRequest(
    method: string,
    url: string,
    headers: any,
    body: any,
    requiredRoles?: string[],
    jwtSecret?: string,
    query?: any,
  ) {
    // JWT 인증 및 역할 검사
    if (requiredRoles && requiredRoles.length > 0) {
      const authHeader = headers['authorization'] || headers['Authorization'];
      if (!authHeader) throw new UnauthorizedException('No Authorization header');
      const token = authHeader.replace('Bearer ', '');
      let payload: any;
      try {
        payload = jwt.verify(token, jwtSecret || 'changeme');
      } catch {
        throw new UnauthorizedException('Invalid JWT');
      }
      const userRoles = payload.roles || [];
      const hasRole = userRoles.some((role: string) => requiredRoles.includes(role));
      if (!hasRole) throw new ForbiddenException('Insufficient role');
    }
    // GET 요청일 때 쿼리스트링 붙이기
    if (method === 'GET' && query && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString();
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    // 실제 프록시 요청
    try {
      const resp = await firstValueFrom(
        this.httpService.request({ method, url, headers, data: body })
      );
      return resp.data;
    } catch (error) {
      return {
        status: error.response.status,
        message: error.response.data.message,
      };
    }
  }
} 