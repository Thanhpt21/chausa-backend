// Import các class cần thiết từ NestJS
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Import hằng số ROLES_KEY để đọc metadata từ @Roles decorator
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
// Import enum UserRole để so sánh role người dùng
import { UserRole } from 'src/users/enums/user.enums';

@Injectable() // Đánh dấu guard này có thể được inject
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // Inject Reflector để đọc metadata

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách vai trò yêu cầu từ metadata (được gán bởi @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // metadata gắn trên method
      context.getClass(),   // metadata gắn trên class (controller)
    ]);

    if (!requiredRoles) return true; // Nếu không yêu cầu role nào thì cho phép luôn

    // Lấy user từ request (được gắn bởi JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Kiểm tra xem role của user có nằm trong danh sách requiredRoles không
    return requiredRoles.includes(user.role);
  }
}
