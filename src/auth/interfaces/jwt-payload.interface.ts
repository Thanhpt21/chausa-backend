// src/auth/jwt-payload.interface.ts (Tạo file này)
export interface JwtPayload {
  sub: number; // Đây thường là ID của người dùng (subject)
  email: string;
  role: string;
  // Thêm bất kỳ trường nào khác mà bạn đưa vào payload khi ký JWT
}