// src/common/guards/self-or-admin.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

interface JwtUser {
  id: number;
  email: string;
  role: string;
}

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser; // 👈 Ép kiểu user JWT
    const paramId = parseInt(request.params.id, 10); // 👈 ID được gửi từ route (URL)

    // ✅ Nếu là admin hoặc thao tác trên chính tài khoản của mình thì cho phép
    return user.role === 'admin' || user.id === paramId;
  }
}
