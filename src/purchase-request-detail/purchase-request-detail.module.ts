import { Module } from '@nestjs/common';
import { PurchaseRequestDetailService } from './purchase-request-detail.service';
import { PurchaseRequestDetailController } from './purchase-request-detail.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [PurchaseRequestDetailService, PrismaService],
  controllers: [PurchaseRequestDetailController]
})
export class PurchaseRequestDetailModule {}
