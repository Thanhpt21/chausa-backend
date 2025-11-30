import { Module } from '@nestjs/common';
import { TransferDetailController } from './transfer-detail.controller';
import { TransferDetailService } from './transfer-detail.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [TransferDetailController],
  providers: [TransferDetailService, PrismaService]
})
export class TransferDetailModule {}
