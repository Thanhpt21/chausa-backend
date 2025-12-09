import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ColorService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới một màu sắc
  async create(dto: CreateColorDto) {
    // Validate title không trùng
    const existing = await this.prisma.color.findUnique({
      where: { title: dto.title.trim() },
    });

    if (existing) {
      throw new BadRequestException(`Màu sắc "${dto.title}" đã tồn tại`);
    }

    const color = await this.prisma.color.create({
      data: {
        title: dto.title.trim(),
        sku: dto.sku?.trim() || null, // 🎯 Trim và chuyển empty string thành null
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
      orderBy: { id: 'desc' },
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

    // Kiểm tra title không trùng với màu khác
    if (dto.title && dto.title.trim() !== color.title) {
      const existing = await this.prisma.color.findUnique({
        where: { title: dto.title.trim() },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Màu sắc "${dto.title}" đã tồn tại`);
      }
    }

    const updated = await this.prisma.color.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        sku: dto.sku !== undefined ? (dto.sku?.trim() || null) : undefined, // 🎯 Xử lý sku null
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
    const color = await this.prisma.color.findUnique({ 
      where: { id },
      include: { products: true } // Kiểm tra có sản phẩm nào sử dụng không
    });

    if (!color) {
      throw new NotFoundException('Không tìm thấy màu sắc');
    }

    // Kiểm tra nếu có sản phẩm đang sử dụng màu này
    if (color.products.length > 0) {
      throw new BadRequestException(
        `Không thể xóa màu sắc này vì có ${color.products.length} sản phẩm đang sử dụng`
      );
    }

    await this.prisma.color.delete({ where: { id } });

    return {
      success: true,
      message: 'Màu sắc đã được xóa',
    };
  }
}