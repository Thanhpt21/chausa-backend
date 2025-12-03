// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Request } from 'express'; 
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken, // 👈 lấy từ cookie (ưu tiên)
        ExtractJwt.fromAuthHeaderAsBearerToken(), // 👈 hoặc lấy từ Authorization header
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'defaultSecret',  // ✅ fallback
    });
  }

  async validate(payload: JwtPayload) {
    const result = await this.usersService.getUserById(payload.sub);
    if (!result || !result.data) throw new UnauthorizedException();
    return result.data; // gắn vào request.user
  }
}
