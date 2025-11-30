import { Module } from '@nestjs/common';
import { PrepaymentController } from './prepayment.controller';
import { PrepaymentService } from './prepayment.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [PrepaymentController],
  providers: [PrepaymentService, PrismaService]
})
export class PrepaymentModule {}
