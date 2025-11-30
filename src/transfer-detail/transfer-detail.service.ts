import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, TransferDetail } from '@prisma/client';
import { CreateTransferDetailDto } from './dto/create-transfer-detail.dto';
import { UpdateTransferDetailDto } from './dto/update-transfer-detail.dto';

@Injectable()
export class TransferDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransferDetailDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const created = await this.prisma.transferDetail.create({
      data: {
        transferId: dto.transferId,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        note: dto.note,
        color: dto.color,
        colorTitle: dto.colorTitle,
        size: dto.size,
        finalPrice: dto.finalPrice ?? dto.quantity * dto.unitPrice,
        unit: dto.unit
      },
    });

    return {
      success: true,
      message: 'Tạo chi tiết phiếu điều chuyển thành công.',
      data: created,
    };
  }

  async findOne(id: number) {
    const found = await this.prisma.transferDetail.findUnique({ where: { id } });

    if (!found) throw new NotFoundException('Không tìm thấy chi tiết phiếu điều chuyển');

    return {
      success: true,
      message: 'Tìm thấy chi tiết phiếu điều chuyển',
      data: found,
    };
  }

  async update(id: number, dto: UpdateTransferDetailDto) {
    const existing = await this.prisma.transferDetail.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Không tìm thấy chi tiết phiếu điều chuyển');

    const updated = await this.prisma.transferDetail.update({
      where: { id },
      data: {
        transferId: dto.transferId ?? existing.transferId,
        productId: dto.productId ?? existing.productId,
        quantity: dto.quantity ?? existing.quantity,
        unitPrice: dto.unitPrice ?? existing.unitPrice,
        note: dto.note ?? existing.note,
        color: dto.color ?? existing.color,
        colorTitle: dto.colorTitle ?? existing.colorTitle,
        size: dto.size ?? existing.size, 
        finalPrice: dto.finalPrice ?? existing.finalPrice,
        unit: dto.unit ?? existing.unit
      },
    });

    return {
      success: true,
      message: 'Cập nhật thành công',
      data: updated,
    };
  }

  async remove(id: number) {
    const found = await this.prisma.transferDetail.findUnique({ where: { id } });

    if (!found) throw new NotFoundException('Không tìm thấy chi tiết phiếu điều chuyển');

    await this.prisma.transferDetail.delete({ where: { id } });

    return {
      success: true,
      message: 'Xoá chi tiết phiếu điều chuyển thành công',
    };
  }

  async findByTransferId(transferId: number) {
    const details = await this.prisma.transferDetail.findMany({
      where: { transferId },
      include: {
        product: {
          select: {
            title: true,
            sku: true,
          },
        },
      },
    });

    return details;
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{
    success: boolean;
    message: string;
    data: TransferDetail[];
    total: number;
    page: number;
    pageCount: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TransferDetailWhereInput = search
      ? {
          product: {
            title: { contains: search, mode: 'insensitive' },
          },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transferDetail.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          product: {
            select: {
              title: true,
              sku: true,
              unit: true,
            },
          },
          transfer: {
            select: {
              id: true,
              transfer_date: true,
            },
          },
        },
      }),
      this.prisma.transferDetail.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách chi tiết phiếu điều chuyển' : 'Không có dữ liệu chi tiết',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }
}


