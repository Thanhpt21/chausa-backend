import { Module } from '@nestjs/common';
import { ExportDetailService } from './export-detail.service';
import { ExportDetailController } from './export-detail.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [ExportDetailService, PrismaService],
  controllers: [ExportDetailController]
})
export class ExportDetailModule {}
