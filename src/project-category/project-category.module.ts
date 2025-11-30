import { Module } from '@nestjs/common';
import { ProjectCategoryService } from './project-category.service';
import { ProjectCategoryController } from './project-category.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [ProjectCategoryService, PrismaService],
  controllers: [ProjectCategoryController]
})
export class ProjectCategoryModule {}
