import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarrantyService {
  constructor(private prisma: PrismaService) {}

  // 👉 Tạo bảo hành mới
  async create(dto: CreateWarrantyDto) {
    const warranty = await this.prisma.warranty.create({
      data: {
        note: dto.note,
        isResolved: dto.isResolved ?? false,
         title: dto.title,
        model: dto.model,
        quantity: dto.quantity,
        colorTitle: dto.colorTitle,
      },
    });

    return {
      success: true,
      message: 'Đã tạo yêu cầu bảo hành',
      data: warranty,
    };
  }

  // 👉 Lấy tất cả bảo hành (có phân trang + tìm kiếm theo note)
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.WarrantyWhereInput = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.warranty.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warranty.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách bảo hành' : 'Không có bảo hành nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // 👉 Lấy bảo hành theo ID
  async findOne(id: number) {
    const warranty = await this.prisma.warranty.findUnique({
      where: { id },
    });

    if (!warranty) {
      throw new NotFoundException('Không tìm thấy thông tin bảo hành');
    }

    return {
      success: true,
      message: 'Chi tiết bảo hành',
      data: warranty,
    };
  }

  // 👉 Cập nhật bảo hành
  async update(id: number, dto: UpdateWarrantyDto) {
    const existing = await this.prisma.warranty.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy bảo hành để cập nhật');
    }

    const updated = await this.prisma.warranty.update({
      where: { id },
      data: {
        note: dto.note ?? existing.note,
        isResolved: dto.isResolved ?? existing.isResolved,
        title: dto.title ?? existing.title,
        model: dto.model ?? existing.model,
        quantity: dto.quantity ?? existing.quantity,
        colorTitle: dto.colorTitle ?? existing.colorTitle,
      },
    });

    return {
      success: true,
      message: 'Đã cập nhật bảo hành',
      data: updated,
    };
  }

  // 👉 Xoá bảo hành
  async remove(id: number) {
    const existing = await this.prisma.warranty.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy bảo hành');
    }

    await this.prisma.warranty.delete({ where: { id } });

    return {
      success: true,
      message: 'Đã xoá bảo hành',
    };
  }
}
