import { Module } from '@nestjs/common';
import { PurchaseRequestController } from './purchase-request.controller';
import { PurchaseRequestService } from './purchase-request.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [PurchaseRequestController],
  providers: [PurchaseRequestService, PrismaService]
})
export class PurchaseRequestModule {}
