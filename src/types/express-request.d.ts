import * as multer from 'multer';

declare global {
  namespace Express {
    // Khai báo thêm Request user nếu có
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        phoneNumber: number | null;
        profilePicture: string | null;
        gender: string | null;
        role: string;
        type_account: string;
        isActive: boolean;
      };
    }

    // Mở rộng Multer namespace
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export {};