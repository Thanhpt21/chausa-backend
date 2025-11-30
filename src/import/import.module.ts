import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [ImportService, PrismaService],
  controllers: [ImportController]
})
export class ImportModule {}
