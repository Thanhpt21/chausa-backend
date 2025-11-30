// src/utils/file.util.ts
import * as crypto from 'crypto';

export function extractPublicId(url: string | null): string | null {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const folder = parts[parts.length - 2]; // user/product/news
    const filename = parts[parts.length - 1].split('.')[0]; // publicId
    return `${folder}/${filename}`;
  } catch (err) {
    return null;
  }
}


export  function generateSecureRandomCode(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length); // Lấy các byte ngẫu nhiên
  let result = '';
  for (let i = 0; i < length; i++) {
    // Dùng modulo để ánh xạ byte về chỉ mục của 'characters'
    result += characters.charAt(bytes[i] % characters.length);
  }
  return result;
}


