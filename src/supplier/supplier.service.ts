import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới supplier
  async create(dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        email: dto.email ?? null,
        address: dto.address,
        mst: dto.mst ?? null,
      },
    });

    return {
      success: true,
      message: 'Nhà cung cấp đã được tạo thành công',
      data: supplier,
    };
  }

  // Lấy danh sách nhà cung cấp với phân trang và tìm kiếm
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SupplierWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.supplier.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách nhà cung cấp' : 'Không có nhà cung cấp nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }
    

  async findAllWithoutPagination(search = '') {
    // Định nghĩa whereClause cho việc tìm kiếm
    const whereClause: Prisma.SupplierWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}; // Nếu không có search thì không có filter nào

    try {
      // Lấy tất cả nhà cung cấp mà không có phân trang
      const suppliers = await this.prisma.supplier.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }, // Sắp xếp theo ngày tạo giảm dần
      });

      // Trả về kết quả
      return {
        success: true,
        message: suppliers.length > 0 ? 'Danh sách nhà cung cấp' : 'Không có nhà cung cấp nào',
        data: suppliers,
      };
    } catch (error) {
      // Nếu có lỗi, trả về thông báo lỗi
      throw new Error('Có lỗi khi truy vấn dữ liệu nhà cung cấp');
    }
  }


  // Lấy thông tin 1 nhà cung cấp theo id
async findOne(id: number) {
  const supplier = await this.prisma.supplier.findUnique({
    where: { id },  // Đảm bảo rằng id đã được cung cấp
  });

  if (!supplier) {
    throw new NotFoundException('Không tìm thấy nhà cung cấp');
  }

  return {
    success: true,
    message: 'Tìm thấy nhà cung cấp',
    data: supplier,
  };
}

  // Cập nhật thông tin nhà cung cấp
  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    const updated = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: dto.name ?? supplier.name,
        phoneNumber: dto.phoneNumber ?? supplier.phoneNumber,
        email: dto.email ?? supplier.email,
        address: dto.address ?? supplier.address,
        mst: dto.mst
      },
    });

    return {
      success: true,
      message: 'Nhà cung cấp đã được cập nhật',
      data: updated,
    };
  }

  // Xóa nhà cung cấp
  async remove(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    await this.prisma.supplier.delete({ where: { id } });

    return {
      success: true,
      message: 'Nhà cung cấp đã được xóa',
    };
  }
}
