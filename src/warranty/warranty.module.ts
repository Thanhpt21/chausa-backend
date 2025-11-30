import { Module } from '@nestjs/common';
import { WarrantyController } from './warranty.controller';
import { WarrantyService } from './warranty.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [WarrantyController],
  providers: [WarrantyService, PrismaService]
})
export class WarrantyModule {}
