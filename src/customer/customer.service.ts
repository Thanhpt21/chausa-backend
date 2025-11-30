import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        phoneNumber: dto.phoneNumber ?? null,
        email: dto.email ?? null,
        address: dto.address,
        mst: dto.mst ?? null,
        loyaltyPoint: dto.loyaltyPoint
      },
    });
    

    return {
      success: true,
      message: 'Khách hàng đã được tạo thành công',
      data: customer,
    };
  }

  async findAll(page = 1, limit = 10,   search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CustomerWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.customer.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách khách hàng' : 'Không có khách hàng nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findAllWithoutPagination(search = '') {
    const whereClause: Prisma.CustomerWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const items = await this.prisma.customer.findMany({
      where: whereClause,
      orderBy: { id: 'desc' }, // Sắp xếp theo id giảm dần
    });

    return {
      success: true,
      message: items.length > 0 ? 'Danh sách khách hàng' : 'Không có khách hàng nào',
      data: items,
      total: items.length,
    };
  }


  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return {
      success: true,
      message: 'Tìm thấy khách hàng',
      data: customer,
    };
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name ?? customer.name,
        phoneNumber: dto.phoneNumber ?? customer.phoneNumber,
        email: dto.email ?? customer.email,
        address: dto.address ?? customer.address,
        mst: dto.mst ?? customer.mst,
        loyaltyPoint: dto.loyaltyPoint ?? customer.loyaltyPoint
      },
    });

    return {
      success: true,
      message: 'Khách hàng đã được cập nhật',
      data: updated,
    };
  }

  async remove(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    await this.prisma.customer.delete({ where: { id } });

    return {
      success: true,
      message: 'Khách hàng đã được xóa',
    };
  }
}
