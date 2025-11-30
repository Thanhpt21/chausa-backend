// src/auth/auth.service.ts
import { BadRequestException, Injectable, NotFoundException, Post, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { AccountType } from 'src/users/enums/user.enums';
import { PrismaService } from 'prisma/prisma.service';
import { randomBytes } from 'crypto';
import { Response } from 'express';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { GoogleUserPayload } from './interfaces/google-user-payload.interface';

// Utility function to add minutes to a Date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService
  ) {}

  // ✅ Xác thực thông tin đăng nhập
  async validateUser(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // >>> THAY ĐỔI Ở ĐÂY <<<
    // Kiểm tra nếu user.password là null, tức là tài khoản không có mật khẩu cục bộ
    if (user.password === null) {
      // Nếu tài khoản không có mật khẩu (ví dụ: tài khoản Google), không cho phép đăng nhập bằng mật khẩu truyền thống.
      throw new UnauthorizedException('Invalid credentials');
    }

    // Bây giờ TypeScript biết user.password chắc chắn là string
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Bỏ trường password ra khỏi kết quả trả về để bảo mật
      const { password, ...result } = user;
      return result;
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // ✅ Trả về token
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      success: true,
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        type_account: user.type_account,
        isActive: user.isActive,
        access_token: this.jwtService.sign(payload),
      },
    };
  }



  // ✅ Đăng ký
    async register(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
        ...dto,
        password: hashedPassword,
        role: dto.role || 'customer',
        type_account: AccountType.NORMAL,
    });

    return {
      success: true,
      message: 'User registered successfully',
      data: new UserResponseDto(user),
    };
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException('Email is required');

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('Email not found');

    const token = randomBytes(32).toString('hex');
    const expiresAt = addMinutes(new Date(), 30);

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const resetLink = `${frontendUrl}/vi/reset-password?token=${token}`;
    await this.emailService.sendResetPasswordEmail(email, resetLink);

     return {
      success: true,
      message: 'Reset link sent to your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    await this.prisma.passwordResetToken.delete({ where: { token } });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async googleLogin(googleUser: GoogleUserPayload) {
    const { email, name, photo } = googleUser;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Nếu chưa có user → tạo mới
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          profilePicture: photo,
          isActive: true,
          role: 'customer',
          type_account: 'google', // enum AccountType
        },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      success: true,
      message: 'Login with Google successful',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        type_account: user.type_account,
        isActive: user.isActive,
      },
    };
    }

}
