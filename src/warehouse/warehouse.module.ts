import { Module } from '@nestjs/common';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, PrismaService]
})
export class WarehouseModule {}
