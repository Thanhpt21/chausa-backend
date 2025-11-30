import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PurchaseRequestStatus, Prisma } from '@prisma/client';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';

@Injectable()
export class PurchaseRequestService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới 1 phiếu mua hàng
  async create(userId: number, dto: CreatePurchaseRequestDto) {
    const totalAmount = 0;
    const data: any = {
      userId,
      note: dto.note,
      status: dto.status,
      total_amount: totalAmount,
      supplierId: dto.supplierId,
    };

    if (dto.purchase_date) {
      data.purchase_date = new Date(dto.purchase_date);
    }

    const created = await this.prisma.purchaseRequest.create({
      data,
    });

    return {
      success: true,
      message: 'Tạo phiếu mua hàng thành công',
      data: created,
    };
  }

  // Lấy danh sách phiếu mua hàng
  async findAll(page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;

    const statusEnum = (status && Object.values(PurchaseRequestStatus).includes(status as PurchaseRequestStatus))
      ? (status as PurchaseRequestStatus)
      : undefined;

    const whereClause: Prisma.PurchaseRequestWhereInput = {
      ...(statusEnum && { status: statusEnum }),
      ...(search && {
        OR: [
          { note: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          details: {
            include: { product: true },
          },
          supplier: true,
        },
      }),
      this.prisma.purchaseRequest.count({ where: whereClause }),
    ]);

    // Tính tổng số tiền của mỗi phiếu mua hàng (nếu cần)
    const itemsWithTotalAmount = items.map(item => {
      const totalAmount = item.details.reduce((sum, detail) => {
        return sum + (detail.unitPrice * detail.quantity);
      }, 0);

      return {
        ...item,
        totalAmount,
      };
    });

    return {
      success: true,
      message: total > 0 ? 'Danh sách phiếu mua hàng' : 'Không có phiếu mua hàng nào',
      data: itemsWithTotalAmount,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy chi tiết 1 phiếu mua hàng
  async findOne(id: number) {
    const found = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        user: true,
        details: {
          include: { product: true },
        },
      },
    });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu mua hàng');
    }

    return {
      success: true,
      message: 'Tìm thấy phiếu mua hàng',
      data: found,
    };
  }

  // Cập nhật phiếu mua hàng
  async update(id: number, dto: UpdatePurchaseRequestDto) {
    const found = await this.prisma.purchaseRequest.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu mua hàng');
    }

    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        note: dto.note ?? found.note,
        status: dto.status ?? found.status,
        supplierId: dto.supplierId ?? found.supplierId,
        purchase_date: dto.purchase_date ? new Date(dto.purchase_date) : found.purchase_date,
      },
    });

    return {
      success: true,
      message: 'Cập nhật phiếu mua hàng thành công',
      data: updated,
    };
  }

  // Xoá phiếu mua hàng
  async remove(id: number) {
    const found = await this.prisma.purchaseRequest.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu mua hàng');
    }

    await this.prisma.purchaseRequest.delete({ where: { id } });

    return {
      success: true,
      message: 'Đã xoá phiếu mua hàng',
    };
  }

  // Thống kê phiếu mua hàng theo trạng thái
  async getStats() {
    const [total, completed, pending, cancelled] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.count(),
      this.prisma.purchaseRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.purchaseRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.purchaseRequest.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      success: true,
      message: 'Thống kê phiếu mua hàng',
      data: {
        total,
        completed,
        pending,
        cancelled,
      },
    };
  }

  // Cập nhật trạng thái phiếu mua hàng
  async updateStatus(id: number, status: PurchaseRequestStatus) {
    const found = await this.prisma.purchaseRequest.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu mua hàng');
    }

    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: 'Cập nhật trạng thái phiếu mua hàng thành công',
      data: updated,
    };
  }
}
