// src/combo/combo.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ComboService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới combo
  async create(dto: CreateComboDto) {
    const combo = await this.prisma.combo.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
      },
    });

    return {
      success: true,
      message: 'Combo đã được tạo thành công',
      data: combo,
    };
  }

  // Lấy danh sách combo có phân trang
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ComboWhereInput = search
      ? {
          title: { contains: search, mode: 'insensitive' },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.combo.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.combo.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách combo' : 'Không có combo nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy danh sách combo không phân trang
  async findAllWithoutPagination(search = '') {
    const whereClause: Prisma.ComboWhereInput = search
      ? {
          title: { contains: search, mode: 'insensitive' },
        }
      : {};

    const items = await this.prisma.combo.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: items.length > 0 ? 'Danh sách combo' : 'Không có combo nào',
      data: items,
      total: items.length,
    };
  }

  // Lấy chi tiết combo theo id
  async findOne(id: number) {
    const combo = await this.prisma.combo.findUnique({ where: { id } });

    if (!combo) {
      throw new NotFoundException('Không tìm thấy combo');
    }

    return {
      success: true,
      message: 'Tìm thấy combo',
      data: combo,
    };
  }

  // Cập nhật combo
  async update(id: number, dto: UpdateComboDto) {
    const combo = await this.prisma.combo.findUnique({ where: { id } });

    if (!combo) {
      throw new NotFoundException('Không tìm thấy combo');
    }

    const updated = await this.prisma.combo.update({
      where: { id },
      data: {
        title: dto.title ?? combo.title,
        description: dto.description ?? combo.description,
      },
    });

    return {
      success: true,
      message: 'Combo đã được cập nhật',
      data: updated,
    };
  }

  // Xóa combo
  async remove(id: number) {
    const combo = await this.prisma.combo.findUnique({ where: { id } });

    if (!combo) {
      throw new NotFoundException('Không tìm thấy combo');
    }

    await this.prisma.combo.delete({ where: { id } });

    return {
      success: true,
      message: 'Combo đã được xóa',
    };
  }

}

