import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, ExportDetail, Product } from '@prisma/client';
import { CreateExportDetailDto } from './dto/create-export-detail.dto';
import { UpdateExportDetailDto } from './dto/update-export-detail.dto';

@Injectable()
export class ExportDetailService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới export detail
  async create(dto: CreateExportDetailDto): Promise<{ success: boolean; message: string; data: ExportDetail }> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const discount = (dto.discountPercent ?? 0) / 100;
    const totalBeforeDiscount = dto.unitPrice * dto.quantity;
    const finalPrice = totalBeforeDiscount - (totalBeforeDiscount * discount);

    const data: any = {
      exportId: dto.exportId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      note: dto.note,
      color: dto.color,
      colorTitle: dto.colorTitle,
      size: dto.size,
      unit: dto.unit,
      discountPercent: dto.discountPercent,
      finalPrice,
      projectCategoryId: dto.projectCategoryId !== undefined ? dto.projectCategoryId : null,
      projectCategoryOrder: dto.projectCategoryOrder !== undefined ? dto.projectCategoryOrder : 1,
      projectCategoryTitle: dto.projectCategoryTitle ?? null,
    };


    const created = await this.prisma.exportDetail.create({ data });

    const exportDetails = await this.prisma.exportDetail.findMany({
      where: { exportId: dto.exportId },
    });

    const totalAmount = exportDetails.reduce((total, detail) => {
      return total + (detail.finalPrice ?? detail.unitPrice * detail.quantity);
    }, 0);

    await this.prisma.export.update({
      where: { id: dto.exportId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Tạo chi tiết phiếu xuất thành công và đã cập nhật lại tổng tiền.',
      data: created,
    };
  }

  // Lấy chi tiết export detail theo id
  async findOne(id: number): Promise<{ success: boolean; message: string; data: ExportDetail }> {
    const found = await this.prisma.exportDetail.findUnique({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu xuất');
    }

    return {
      success: true,
      message: 'Tìm thấy chi tiết phiếu xuất',
      data: found,
    };
  }

  // Cập nhật chi tiết export detail
  async update(id: number, dto: UpdateExportDetailDto): Promise<{ success: boolean; message: string; data: ExportDetail }> {
    const found = await this.prisma.exportDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu xuất');
    }

    const hasSignificantChange =
      (dto.quantity !== undefined && dto.quantity !== found.quantity) ||
      (dto.unitPrice !== undefined && dto.unitPrice !== found.unitPrice);

    const dataToUpdate: any = {
      exportId: dto.exportId ?? found.exportId,
      productId: dto.productId ?? found.productId,
      quantity: dto.quantity ?? found.quantity,
      unitPrice: dto.unitPrice ?? found.unitPrice,
      note: dto.note ?? found.note,
      color: dto.color ?? found.color,
      colorTitle: dto.colorTitle ?? found.colorTitle,
      size: dto.size ?? found.size, 
      unit: dto.unit ?? found.unit,
      projectCategoryTitle: dto.projectCategoryTitle ?? found.projectCategoryTitle,
    };

    // Xử lý projectCategoryId và projectCategoryOrder
    dataToUpdate.projectCategoryId =
      dto.projectCategoryId !== undefined ? dto.projectCategoryId : null;

    dataToUpdate.projectCategoryOrder =
      dto.projectCategoryOrder !== undefined ? dto.projectCategoryOrder : null;

    const updated = await this.prisma.exportDetail.update({
      where: { id },
      data: dataToUpdate,
    });

    if (hasSignificantChange) {
      const exportDetails = await this.prisma.exportDetail.findMany({
        where: { exportId: updated.exportId },
      });

      const totalAmount = exportDetails.reduce((total, detail) => {
        return total + detail.quantity * detail.unitPrice;
      }, 0);

      await this.prisma.export.update({
        where: { id: updated.exportId },
        data: { total_amount: totalAmount },
      });

      return {
        success: true,
        message: 'Cập nhật thành công và đã cập nhật lại tổng tiền của phiếu xuất.',
        data: updated,
      };
    }

    return {
      success: true,
      message: 'Cập nhật thành công. Không cần tính lại tổng tiền.',
      data: updated,
    };
  }


  // Xoá chi tiết export detail
  async remove(id: number): Promise<{ success: boolean; message: string }> {
    // Lấy thông tin chi tiết phiếu xuất cần xóa
    const found = await this.prisma.exportDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu xuất');
    }

    // Tiến hành xóa chi tiết phiếu xuất
    await this.prisma.exportDetail.delete({ where: { id } });

    // Tính lại tổng tiền của phiếu xuất sau khi xóa chi tiết
    const exportDetails = await this.prisma.exportDetail.findMany({
      where: { exportId: found.exportId },
    });

    const totalAmount = exportDetails.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitPrice); // Tính tổng số tiền của phiếu xuất
    }, 0);

    // Cập nhật lại tổng tiền của phiếu xuất sau khi xóa chi tiết
    await this.prisma.export.update({
      where: { id: found.exportId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Đã xoá chi tiết phiếu xuất và cập nhật lại tổng tiền của phiếu xuất.',
    };
  }

  // Tuỳ chọn: lấy danh sách exportDetails theo exportId
  async findByExportId(exportId: number) {
    const details = await this.prisma.exportDetail.findMany({
      where: { exportId },
      include: {
        product: {
          select: {
            title: true,
            sku: true,
            unit: true,
            description: true
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
    data: ExportDetail[];
    total: number;
    page: number;
    pageCount: number;
  }> {
    const skip = (page - 1) * limit;

    // Nếu bạn muốn tìm theo tên sản phẩm thì cần join sang bảng product
    const whereClause: Prisma.ExportDetailWhereInput = search
      ? {
          product: {
            title: { contains: search, mode: 'insensitive' },
          },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.exportDetail.findMany({
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
          export: {
            select: {
              id: true,
              export_date: true,
            },
          },
        },
      }),
      this.prisma.exportDetail.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách chi tiết phiếu xuất' : 'Không có dữ liệu chi tiết phiếu xuất',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async updateProjectCategoryOrderByCategory(
    exportId: number,
    projectCategoryId: number | null,
    projectCategoryOrder: number,
  ): Promise<{ success: boolean; message: string; updatedCount: number }> {
    const updated = await this.prisma.exportDetail.updateMany({
      where: {
        exportId,
        projectCategoryId: projectCategoryId ?? null,
      },
      data: {
        projectCategoryOrder: projectCategoryOrder,
      },
    });

    return {
      success: true,
      message: `Đã cập nhật projectCategoryOrder = ${projectCategoryOrder} cho ${updated.count} dòng.`,
      updatedCount: updated.count,
    };
  }
}

