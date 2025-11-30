import { Module } from '@nestjs/common';
import { ProductComboService } from './product-combo.service';
import { ProductComboController } from './product-combo.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [ProductComboService, PrismaService],
  controllers: [ProductComboController]
})
export class ProductComboModule {}
