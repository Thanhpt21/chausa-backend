// src/auth/interfaces/google-user-payload.interface.ts (Tạo file này)
export interface GoogleUserPayload {
  email: string;
  name: string;
  photo?: string; // Optional, vì có thể không phải lúc nào cũng có
  provider?: string; // Tùy chọn, nếu bạn muốn lưu trữ nhà cung cấp
  accessToken?: string; // Access Token từ Google, không phải JWT của bạn
}