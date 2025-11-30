// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [UploadService, CloudinaryProvider],
  controllers: [UploadController],
  exports: [UploadService], // 👈 để UsersModule dùng được UploadService
})
export class UploadModule {}
