import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ExportStatus, Prisma } from '@prisma/client';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới 1 phiếu xuất
  async create(userId: number, dto: CreateExportDto) {
    const data: any = {
      userId,
      note: dto.note,
      status: dto.status,
      customerId: dto.customerId,
      export_date: new Date(dto.export_date),
      vat: dto.vat ?? 0,
      pitRate: dto.pitRate ?? 0,
      extra_cost: dto.extra_cost || 0,
      additional_cost: dto.additional_cost || 0,
      total_amount: 0,
      isProject: dto.isProject ?? false,
      advancePercent: dto.advancePercent ?? null,
    };

    const created = await this.prisma.export.create({
      data: data,
    });

    return {
      success: true,
      message: 'Tạo phiếu xuất thành công',
      data: created,
    };
  }


  // Lấy danh sách phiếu xuất
  async findAll(page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;

    const statusEnum = (status && Object.values(ExportStatus).includes(status as ExportStatus))
        ? (status as ExportStatus)
        : undefined;

    const whereClause: Prisma.ExportWhereInput = {
        ...(statusEnum && { status: statusEnum }),
        ...(search && {
          OR: [
            { note: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
    };

    // Lấy dữ liệu phiếu xuất cùng các relation
    const [items, total] = await this.prisma.$transaction([
      this.prisma.export.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          exportDetails: {
            include: { product: true },
          },
          customer: true,
          prepayment: true,
        },
      }),
      this.prisma.export.count({ where: whereClause }),
    ]);

    // Tính toán lại total_amount, vat_amount, grand_total cho mỗi phiếu xuất
    const itemsWithTotals = items.map(item => {
    const rawTotal = item.exportDetails.reduce((sum, detail) => {
      return sum + (detail.finalPrice ?? 0);
    }, 0);

    const loyaltyPointAmount = item.loyaltyPointAmount ?? 0;
    const totalAmount = rawTotal - loyaltyPointAmount;

     const vatRate = item.vat ?? 0;
    const pitRate = item.pitRate ?? 0;

    // Nếu có pitRate > 0 thì bỏ qua VAT, ngược lại thì tính VAT
    const vatAmount = pitRate > 0 ? 0 : (totalAmount * vatRate) / 100;
    const pitRateAmount = pitRate > 0 ? (totalAmount * pitRate) / 100 : 0;

    const grandTotal = totalAmount + vatAmount + pitRateAmount;

      return {
        ...item,
        total_amount: totalAmount,
        vat_amount: vatAmount,
        pitRate_amount: pitRateAmount,
        grand_total: grandTotal,
        prepayment_amount: item.prepayment?.amountMoney ?? 0,
      };
    });

    return {
      success: true,
      message: total > 0 ? 'Danh sách phiếu xuất' : 'Không có phiếu xuất nào',
      data: itemsWithTotals,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy chi tiết 1 phiếu xuất
  async findOne(id: number) {
    const found = await this.prisma.export.findUnique({
      where: { id },
      include: {
        user: true,
        exportDetails: {
          include: { product: true },
        },
        customer: true,
      },
    });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu xuất');
    }

    return {
      success: true,
      message: 'Tìm thấy phiếu xuất',
      data: found,
    };
  }

  // Cập nhật phiếu xuất
  async update(id: number, dto: UpdateExportDto) {
    const found = await this.prisma.export.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu xuất');
    }

    // Chuẩn bị dữ liệu update
    const data: any = {
      note: dto.note ?? found.note,
      status: dto.status ?? found.status,
      customerId: dto.customerId ?? found.customerId,
      export_date: dto.export_date ? new Date(dto.export_date) : found.export_date,
      extra_cost: dto.extra_cost ?? found.extra_cost,
      additional_cost: dto.additional_cost ?? found.additional_cost,
      vat: dto.vat ?? found.vat,
      pitRate: dto.pitRate ?? found.pitRate,
      prepaymentId: dto.prepaymentId ?? found.prepaymentId,
      isProject: dto.isProject ?? found.isProject,
      advancePercent: dto.advancePercent ?? found.advancePercent,
    };

    // Logic xử lý loyalty point
    if (dto.applyLoyaltyPoint !== undefined) {
      data.applyLoyaltyPoint = dto.applyLoyaltyPoint;

      if (dto.applyLoyaltyPoint === true) {
        data.loyaltyPointUsed = dto.loyaltyPointUsed ?? found.loyaltyPointUsed;
        data.loyaltyPointAmount = dto.loyaltyPointAmount ?? found.loyaltyPointAmount;
      } else {
        data.loyaltyPointUsed = 0;
        data.loyaltyPointAmount = 0;
      }
    }

    const updated = await this.prisma.export.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'Cập nhật phiếu xuất thành công',
      data: updated,
    };
  }
  // Xoá phiếu xuất
  async remove(id: number) {
    const found = await this.prisma.export.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu xuất');
    }

    await this.prisma.export.delete({ where: { id } });

    return {
      success: true,
      message: 'Đã xoá phiếu xuất',
    };
  }

  async updateStatus(id: number, status: ExportStatus) {
    const found = await this.prisma.export.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu xuất');
    }

    const updated = await this.prisma.export.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: 'Cập nhật trạng thái phiếu xuất thành công',
      data: updated,
    };
  }

  async getExportStats() {
    const [total, pending, exporting, cancelled, rejected, returned, completed] = await Promise.all([
      this.prisma.export.count(), // Tổng số phiếu xuất
      this.prisma.export.count({ where: { status: 'PENDING' } }), // Phiếu xuất đang chờ xử lý
      this.prisma.export.count({ where: { status: 'EXPORTED' } }), // Phiếu xuất đã xuất kho
      this.prisma.export.count({ where: { status: 'CANCELLED' } }), // Phiếu xuất đã huỷ
      this.prisma.export.count({ where: { status: 'REJECTED' } }), // Phiếu xuất đã bị từ chối
      this.prisma.export.count({ where: { status: 'RETURNED' } }), // Phiếu xuất đã được trả lại
      this.prisma.export.count({ where: { status: 'COMPLETED' } }),
    ]);

    return {
      success: true,
      message: 'Thống kê phiếu xuất',
      data: {
        total,
        pending,
        exporting,
        cancelled,
        rejected,
        returned,
        completed,
      },
    };
  }


  async getTotalRevenueAccurate(startDate: Date, endDate: Date) {
    const exports = await this.prisma.export.findMany({
      where: {
        status: {
          in: ['EXPORTED', 'COMPLETED', 'REJECTED', 'PREPARED'], // Gộp cả PREPARED
        },
        export_date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Tổng doanh thu & chi phí tất cả
    let totalRevenue = 0;
    let totalExtraCost = 0;
    let totalAdditionalCost = 0;

    // Doanh thu theo từng trạng thái
    let totalRevenueExported = 0;
    let totalExtraCostExported = 0;
    let totalAdditionalCostExported = 0;

    let totalRevenueCompleted = 0;
    let totalExtraCostCompleted = 0;
    let totalAdditionalCostCompleted = 0;

    exports.forEach((exp) => {
      const vatAmount = exp.vat ? (exp.total_amount * exp.vat) / 100 : 0;
      const pitAmount = exp.pitRate ? (exp.total_amount * exp.pitRate) / 100 : 0;
      const taxAmount = vatAmount > 0 ? vatAmount : pitAmount;

      const preTaxAmount = exp.total_amount ?? 0;
      const additionalCost = exp.additional_cost ?? 0;
      const extraCost = exp.extra_cost ?? 0;
      const loyaltyDiscount = exp.loyaltyPointAmount ?? 0;

      const grandTotal = preTaxAmount + taxAmount + additionalCost - extraCost - loyaltyDiscount;

      if (exp.status === 'REJECTED') {
        // Không cộng revenue, chỉ cộng chi phí
        totalExtraCost += extraCost;
        totalAdditionalCost += additionalCost;
      } else {
        // Tổng doanh thu chung
        totalRevenue += grandTotal;
        totalExtraCost += extraCost;
        totalAdditionalCost += additionalCost;

        if (exp.status === 'EXPORTED' || exp.status === 'PREPARED') {
          // Gộp PREPARED vào EXPORTED
          totalRevenueExported += grandTotal;
          totalExtraCostExported += extraCost;
          totalAdditionalCostExported += additionalCost;
        } else if (exp.status === 'COMPLETED') {
          totalRevenueCompleted += grandTotal;
          totalExtraCostCompleted += extraCost;
          totalAdditionalCostCompleted += additionalCost;
        }
      }
    });

    return {
      success: true,
      message: 'Tổng doanh thu chính xác theo khoảng thời gian và trạng thái',
      data: {
        totalRevenue,
        totalExtraCost,
        totalAdditionalCost,

        totalRevenueExported,
        totalExtraCostExported,
        totalAdditionalCostExported,

        totalRevenueCompleted,
        totalExtraCostCompleted,
        totalAdditionalCostCompleted,
      },
    };
  }



  async getPrepaymentAmountByExportId(exportId: number) {
    // 1. Lấy thông tin phiếu xuất
    const exportRecord = await this.prisma.export.findUnique({
      where: { id: exportId },
      include: {
        prepayment: true, // Include bảng báo giá
      },
    });

    if (!exportRecord) {
      throw new NotFoundException('Không tìm thấy phiếu xuất');
    }

    if (!exportRecord.prepaymentId || !exportRecord.prepayment) {
      return {
        success: false,
        message: 'Phiếu xuất không có báo giá đính kèm',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Lấy số tiền báo giá thành công',
      data: {
        prepaymentId: exportRecord.prepayment.id,
        amount: exportRecord.prepayment.amountMoney,
      },
    };
  }


}
