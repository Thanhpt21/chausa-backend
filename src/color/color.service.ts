import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ColorService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới một màu sắc
  async create(dto: CreateColorDto) {
    const color = await this.prisma.color.create({
      data: {
        title: dto.title,
        sku: dto.sku,
      },
    });

    return {
      success: true,
      message: 'Màu sắc đã được tạo thành công',
      data: color,
    };
  }

  // Lấy danh sách tất cả các màu sắc với phân trang
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ColorWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.color.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.color.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách màu sắc' : 'Không có màu sắc nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy danh sách tất cả màu sắc mà không phân trang
  async findAllWithoutPagination(search = '') {
    const whereClause: Prisma.ColorWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const items = await this.prisma.color.findMany({
      where: whereClause,
      orderBy: { id: 'desc' }, // Sắp xếp theo id giảm dần
    });

    return {
      success: true,
      message: items.length > 0 ? 'Danh sách màu sắc' : 'Không có màu sắc nào',
      data: items,
      total: items.length,
    };
  }

  // Tìm một màu sắc theo id
  async findOne(id: number) {
    const color = await this.prisma.color.findUnique({ where: { id } });

    if (!color) {
      throw new NotFoundException('Không tìm thấy màu sắc');
    }

    return {
      success: true,
      message: 'Tìm thấy màu sắc',
      data: color,
    };
  }

  // Cập nhật thông tin màu sắc
  async update(id: number, dto: UpdateColorDto) {
    const color = await this.prisma.color.findUnique({ where: { id } });

    if (!color) {
      throw new NotFoundException('Không tìm thấy màu sắc');
    }

    const updated = await this.prisma.color.update({
      where: { id },
      data: {
        title: dto.title ?? color.title,
        sku: dto.sku ?? color.sku,
      },
    });

    return {
      success: true,
      message: 'Màu sắc đã được cập nhật',
      data: updated,
    };
  }

  // Xóa một màu sắc
  async remove(id: number) {
    const color = await this.prisma.color.findUnique({ where: { id } });

    if (!color) {
      throw new NotFoundException('Không tìm thấy màu sắc');
    }

    await this.prisma.color.delete({ where: { id } });

    return {
      success: true,
      message: 'Màu sắc đã được xóa',
    };
  }
}
