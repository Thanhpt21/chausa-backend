import { Module } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';

@Module({
  controllers: [SalaryController],
  providers: [SalaryService, PrismaService]
})
export class SalaryModule {}