import { Module } from '@nestjs/common';
import { TransferOrderDetailController } from './transfer-order-detail.controller';
import { TransferOrderDetailService } from './transfer-order-detail.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [TransferOrderDetailController],
  providers: [TransferOrderDetailService, PrismaService],
})
export class TransferOrderDetailModule {}
