import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProjectCategoryDto } from './dto/create-project-category.dto';
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectCategoryService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới một hạng mục thi công
  async create(dto: CreateProjectCategoryDto) {
    const projectCategory = await this.prisma.projectCategory.create({
      data: {
        title: dto.title,
      },
    });

    return {
      success: true,
      message: 'Hạng mục thi công đã được tạo thành công',
      data: projectCategory,
    };
  }

  // Lấy danh sách tất cả các hạng mục thi công với phân trang
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProjectCategoryWhereInput = search
      ? {
          title: { contains: search, mode: 'insensitive' },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.projectCategory.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.projectCategory.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách hạng mục thi công' : 'Không có hạng mục nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy danh sách tất cả hạng mục thi công mà không phân trang
  async findAllWithoutPagination(search = '') {
    const whereClause: Prisma.ProjectCategoryWhereInput = search
      ? {
          title: { contains: search, mode: 'insensitive' },
        }
      : {};

    const items = await this.prisma.projectCategory.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: items.length > 0 ? 'Danh sách hạng mục thi công' : 'Không có hạng mục nào',
      data: items,
      total: items.length,
    };
  }

  // Tìm một hạng mục theo id
  async findOne(id: number) {
    const projectCategory = await this.prisma.projectCategory.findUnique({ where: { id } });

    if (!projectCategory) {
      throw new NotFoundException('Không tìm thấy hạng mục thi công');
    }

    return {
      success: true,
      message: 'Tìm thấy hạng mục thi công',
      data: projectCategory,
    };
  }

  // Cập nhật hạng mục thi công
  async update(id: number, dto: UpdateProjectCategoryDto) {
    const projectCategory = await this.prisma.projectCategory.findUnique({ where: { id } });

    if (!projectCategory) {
      throw new NotFoundException('Không tìm thấy hạng mục thi công');
    }

    const updated = await this.prisma.projectCategory.update({
      where: { id },
      data: {
        title: dto.title ?? projectCategory.title,
      },
    });

    return {
      success: true,
      message: 'Hạng mục thi công đã được cập nhật',
      data: updated,
    };
  }

  // Xóa một hạng mục thi công
  async remove(id: number) {
    const projectCategory = await this.prisma.projectCategory.findUnique({ where: { id } });

    if (!projectCategory) {
      throw new NotFoundException('Không tìm thấy hạng mục thi công');
    }

    await this.prisma.projectCategory.delete({ where: { id } });

    return {
      success: true,
      message: 'Hạng mục thi công đã được xóa',
    };
  }
}