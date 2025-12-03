import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response, Request } from 'express'; // Giữ nguyên dòng này
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const result = await this.authService.login(user);
    const { access_token, user: userData } = result;

    // Cấu hình cho localhost
    const isLocalhost = process.env.NODE_ENV !== 'production';
    
    res.cookie('accessToken', access_token, {
      httpOnly: true, // Vẫn giữ httpOnly cho bảo mật
      secure: false,   // QUAN TRỌNG: Đặt false cho localhost
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
      sameSite: 'lax',
      path: '/',
      domain: isLocalhost ? 'localhost' : undefined, // Thêm domain cho localhost
    });

    return { user: userData, access_token };
  }


  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string, newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      path: '/',
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // NestJS Passport sẽ tự động chuyển hướng sang trang đăng nhập Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  // Đảm bảo req.user được coi là any hoặc kiểu cụ thể nếu bạn định nghĩa lại
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // req.user sẽ có kiểu any hoặc kiểu từ Passport.js nếu bạn cấu hình
    if (!req.user) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    const authResult = await this.authService.googleLogin(req.user as any); // Ép kiểu req.user thành any
    // Hoặc nếu bạn muốn type safety hơn, hãy tạo một interface cho GoogleUser
    // interface GoogleUser { id: string; displayName: string; emails: { value: string }[]; photos: { value: string }[]; }
    // const authResult = await this.authService.googleLogin(req.user as GoogleUser);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const nodeEnv = this.configService.get('NODE_ENV');
    const isProduction = nodeEnv === 'production';

    res.cookie('accessToken', authResult.access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
      path: '/',
    });

    res.redirect(`${frontendUrl}/vi`);
  }
}
