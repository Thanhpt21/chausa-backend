import { Module } from '@nestjs/common';
import { ComboController } from './combo.controller';
import { ComboService } from './combo.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ComboController],
  providers: [ComboService, PrismaService]
})
export class ComboModule {}
