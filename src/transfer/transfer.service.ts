import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransferStatus, Prisma } from '@prisma/client';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransferService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới 1 phiếu transfer
  async create(userId: number, dto: CreateTransferDto) {
    const data: any = {
      userId,
      note: dto.note,
      status: dto.status,
      customerId: dto.customerId,
      transfer_date: new Date(dto.transfer_date),
      total_amount: 0,
      isInternal: dto.isInternal ?? false,
    };

    const created = await this.prisma.transfer.create({
      data,
    });

    return {
      success: true,
      message: 'Tạo phiếu chuyển kho thành công',
      data: created,
    };
  }

// Lấy danh sách phiếu transfer
  async findAll(
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
    startDate?: string,  // Thêm startDate
    endDate?: string,    // Thêm endDate
  ) {
    const skip = (page - 1) * limit;

    const statusEnum = status && Object.values(TransferStatus).includes(status as TransferStatus)
      ? (status as TransferStatus)
      : undefined;

    // Xử lý date range
    let dateFilter = {};
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      // Đảm bảo endDate bao gồm cả ngày cuối (23:59:59)
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      dateFilter = {
        AND: [
          ...(start ? [{ createdAt: { gte: start } }] : []),
          ...(end ? [{ createdAt: { lte: end } }] : []),
        ],
      };
    }

    const whereClause: Prisma.TransferWhereInput = {
      ...(statusEnum && { status: statusEnum }),
      ...(search && {
        OR: [
          { note: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(Object.keys(dateFilter).length > 0 && dateFilter), // Thêm date filter
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transfer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          transferDetails: {
            include: { product: true },
          },
          customer: true,
        },
      }),
      this.prisma.transfer.count({ where: whereClause }),
    ]);

    // Tính tổng tiền cho mỗi transfer từ transferDetails
    const itemsWithTotals = items.map(item => {
      const totalAmount = item.transferDetails.reduce((sum, detail) => {
        return sum + (detail.finalPrice ?? 0);
      }, 0);

      return {
        ...item,
        total_amount: totalAmount,
      };
    });

    return {
      success: true,
      message: total > 0 ? 'Danh sách phiếu chuyển kho' : 'Không có phiếu chuyển kho nào',
      data: itemsWithTotals,
      total,
      page,
      pageCount: Math.ceil(total / limit),
      filters: { // Trả về thông tin filter để frontend biết
        status,
        search,
        startDate,
        endDate,
      },
    };
  }

  
  async getTransferStats() {
    const [total, pending, exported, cancelled, completed] = await Promise.all([
      this.prisma.transfer.count(), // Tổng số phiếu chuyển
      this.prisma.transfer.count({ where: { status: 'PENDING' } }), // Phiếu chuyển đang chờ xử lý
      this.prisma.transfer.count({ where: { status: 'EXPORTED' } }), // Phiếu chuyển đã xuất kho
      this.prisma.transfer.count({ where: { status: 'CANCELLED' } }), // Phiếu chuyển đã huỷ
      this.prisma.transfer.count({ where: { status: 'COMPLETED' } }), // Phiếu chuyển đã hoàn thành
    ]);

    return {
      success: true,
      message: 'Thống kê phiếu xuất kho',
      data: {
        total,
        pending,
        exported,
        cancelled,
        completed,
      },
    };
  }

  async getTotalRevenueAccurateForTransfer(startDate: Date, endDate: Date) {
    const transfers = await this.prisma.transfer.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'EXPORTED', 'PREPARED'], // Gộp PREPARED
        },
        transfer_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        transferDetails: true,
      },
    });

    let totalRevenue = 0;

    let totalRevenueExported = 0;
    let totalRevenueCompleted = 0;

    transfers.forEach((transfer) => {
      const totalAmount = transfer.transferDetails.reduce(
        (sum, detail) => sum + (detail.finalPrice ?? 0),
        0
      );

      totalRevenue += totalAmount;

      if (transfer.status === 'EXPORTED' || transfer.status === 'PREPARED') {
        totalRevenueExported += totalAmount;
      } else if (transfer.status === 'COMPLETED') {
        totalRevenueCompleted += totalAmount;
      }
    });

    return {
      success: true,
      message: 'Tổng doanh thu chính xác từ phiếu chuyển trạng thái COMPLETED và EXPORTED (bao gồm PREPARED)',
      data: {
        totalRevenue,
        totalRevenueExported,
        totalRevenueCompleted,
      },
    };
  }
  // Lấy chi tiết 1 phiếu transfer
  async findOne(id: number) {
    const found = await this.prisma.transfer.findUnique({
      where: { id },
      include: {
        user: true,
        transferDetails: {
          include: { product: true },
        },
        customer: true,
      },
    });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu chuyển kho');
    }

    return {
      success: true,
      message: 'Tìm thấy phiếu chuyển kho',
      data: found,
    };
  }

  // Cập nhật phiếu transfer
  async update(id: number, dto: UpdateTransferDto) {
    const found = await this.prisma.transfer.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu chuyển kho');
    }

    const updated = await this.prisma.transfer.update({
      where: { id },
      data: {
        note: dto.note ?? found.note,
        status: dto.status ?? found.status,
        customerId: dto.customerId ?? found.customerId,
        transfer_date: dto.transfer_date ? new Date(dto.transfer_date) : found.transfer_date,
        isInternal: dto.isInternal ?? found.isInternal,
      },
    });

    return {
      success: true,
      message: 'Cập nhật phiếu chuyển kho thành công',
      data: updated,
    };
  }

  // Xóa phiếu transfer
  async remove(id: number) {
    const found = await this.prisma.transfer.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu chuyển kho');
    }

    await this.prisma.transfer.delete({ where: { id } });

    return {
      success: true,
      message: 'Đã xoá phiếu chuyển kho',
    };
  }

  async updateStatus(id: number, status: TransferStatus) {
    const found = await this.prisma.transfer.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu điều chuyển');
    }

    const updated = await this.prisma.transfer.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: 'Cập nhật trạng thái phiếu điều chuyển thành công',
      data: updated,
    };
  }

}
