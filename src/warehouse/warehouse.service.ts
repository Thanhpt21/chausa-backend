import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới kho hàng
  async create(dto: CreateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.create({
      data: {
        name: dto.name,
        address: dto.address,
      },
    });

    return {
      success: true,
      message: 'Kho hàng đã được tạo thành công',
      data: warehouse,
    };
  }

  // Lấy danh sách kho hàng với phân trang và tìm kiếm
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.WarehouseWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.warehouse.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.warehouse.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách kho hàng' : 'Không có kho hàng nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy tất cả kho hàng mà không phân trang
  async findAllWithoutPagination(search = '') {
    const whereClause: Prisma.WarehouseWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    try {
      const warehouses = await this.prisma.warehouse.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        message: warehouses.length > 0 ? 'Danh sách kho hàng' : 'Không có kho hàng nào',
        data: warehouses,
      };
    } catch (error) {
      throw new Error('Có lỗi khi truy vấn dữ liệu kho hàng');
    }
  }

  // Lấy thông tin kho hàng theo ID
  async findOne(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy kho hàng');
    }

    return {
      success: true,
      message: 'Tìm thấy kho hàng',
      data: warehouse,
    };
  }

  // Cập nhật thông tin kho hàng
  async update(id: number, dto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy kho hàng');
    }

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: {
        name: dto.name ?? warehouse.name,
        address: dto.address ?? warehouse.address,
      },
    });

    return {
      success: true,
      message: 'Kho hàng đã được cập nhật',
      data: updated,
    };
  }

  // Xóa kho hàng
  async remove(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy kho hàng');
    }

    await this.prisma.warehouse.delete({ where: { id } });

    return {
      success: true,
      message: 'Kho hàng đã được xóa',
    };
  }
}
