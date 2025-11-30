import { Module } from '@nestjs/common';
import { ImportDetailService } from './import-detail.service';
import { ImportDetailController } from './import-detail.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [ImportDetailService, PrismaService],
  controllers: [ImportDetailController]
})
export class ImportDetailModule {}
