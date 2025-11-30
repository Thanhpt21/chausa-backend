// src/upload/upload.service.ts
import { Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
import { extractPublicId } from 'src/utils/file.util';

@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  async uploadImage(
    file: Express.Multer.File,
    id: number,
    type: 'user' | 'product' | 'blog' | 'category' | 'brand' | 'config' | 'store' | 'banner' | 'blog-category' | 'config' | 'variant' = 'user',
  ): Promise<{ secure_url: string; public_id: string }> {
    let uploadBuffer = file.buffer;

    if (type !== 'blog') {
      uploadBuffer = await sharp(file.buffer)
        .resize(300, 300)
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    const fileName = `${type}_${id}_${uuidv4()}`;

    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          {
            folder: type,
            public_id: fileName,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error('No upload result'));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          },
        )
        .end(uploadBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }

  async deleteImageFromUrl(url: string): Promise<void> {
  const publicId = extractPublicId(url);
  if (publicId) {
    await this.deleteImage(publicId);
  }
}


}
