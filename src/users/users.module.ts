import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { UploadModule } from 'src/upload/upload.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [UploadModule, PrismaModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersModule, UsersService]
})
export class UsersModule {}
