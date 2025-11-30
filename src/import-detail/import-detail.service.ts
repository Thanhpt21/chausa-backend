import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, ImportDetail, Product } from '@prisma/client';
import { CreateImportDetailDto } from './dto/create-import-detail.dto';
import { UpdateImportDetailDto } from './dto/update-import-detail.dto';

@Injectable()
export class ImportDetailService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới import detail
  async create(dto: CreateImportDetailDto): Promise<{ success: boolean; message: string; data: ImportDetail }> {

    // Tạo importDetail mới
    const created = await this.prisma.importDetail.create({
      data: {
        importId: dto.importId,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        color: dto.color,
        colorTitle: dto.colorTitle,
        size: dto.size,
        unit: dto.unit
      },
    });

    // Tính lại tổng số tiền của phiếu nhập
    const importDetails = await this.prisma.importDetail.findMany({
      where: { importId: dto.importId },
    });

    const totalAmount = importDetails.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitPrice); // Tính tổng số tiền của phiếu nhập
    }, 0);

    // Cập nhật lại tổng tiền cho phiếu nhập
    await this.prisma.import.update({
      where: { id: dto.importId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Tạo chi tiết phiếu nhập thành công và đã cập nhật lại tổng tiền của phiếu nhập.',
      data: created,
    };
  }

  // Cập nhật chi tiết import detail
  async update(id: number, dto: UpdateImportDetailDto): Promise<{ success: boolean; message: string; data: ImportDetail }> {
    const found = await this.prisma.importDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu nhập');
    }

    // Cập nhật chi tiết phiếu nhập
    const updated = await this.prisma.importDetail.update({
      where: { id },
      data: {
        importId: dto.importId ?? found.importId,
        productId: dto.productId ?? found.productId,
        quantity: dto.quantity ?? found.quantity,
        unitPrice: dto.unitPrice ?? found.unitPrice,
        color: dto.color ?? found.color,
        colorTitle: dto.colorTitle ?? found.colorTitle,
        size: dto.size ?? found.size, 
        unit: dto.unit ?? found.unit
      },
    });

    // Tính lại tổng số tiền của phiếu nhập nếu có sự thay đổi trong quantity hoặc unitPrice
    const importDetails = await this.prisma.importDetail.findMany({
      where: { importId: updated.importId },
    });

    const totalAmount = importDetails.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitPrice); // Tính tiền của mỗi chi tiết
    }, 0);

    // Cập nhật lại tổng tiền của phiếu nhập
    await this.prisma.import.update({
      where: { id: updated.importId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Cập nhật chi tiết phiếu nhập thành công và đã cập nhật lại tổng tiền của phiếu nhập.',
      data: updated,
    };
  }

  // Lấy chi tiết import detail theo id
  async findOne(id: number): Promise<{ success: boolean; message: string; data: ImportDetail }> {
    const found = await this.prisma.importDetail.findUnique({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu nhập');
    }

    return {
      success: true,
      message: 'Tìm thấy chi tiết phiếu nhập',
      data: found,
    };
  }

  // Xoá chi tiết import detail
  async remove(id: number): Promise<{ success: boolean; message: string }> {
    // Lấy thông tin chi tiết phiếu nhập cần xóa
    const found = await this.prisma.importDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu nhập');
    }

    // Tiến hành xóa chi tiết phiếu nhập
    await this.prisma.importDetail.delete({ where: { id } });

    // Tính lại tổng tiền của phiếu nhập sau khi xóa chi tiết
    const importDetails = await this.prisma.importDetail.findMany({
      where: { importId: found.importId },
    });

    const totalAmount = importDetails.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitPrice); // Tính tổng số tiền của phiếu nhập
    }, 0);

    // Cập nhật lại tổng tiền của phiếu nhập sau khi xóa chi tiết
    await this.prisma.import.update({
      where: { id: found.importId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Đã xoá chi tiết phiếu nhập và cập nhật lại tổng tiền của phiếu nhập.',
    };
  }

  // Tuỳ chọn: lấy danh sách importDetails theo importId
  async findByImportId(importId: number) {
    const details = await this.prisma.importDetail.findMany({
      where: { importId },
      include: {
        product: {
          select: {
            title: true,
            sku: true,
            colors: { // Giả sử bạn có quan hệ giữa product và colors
              select: {
                color: {
                  select: {
                    title: true, // Chỉ lấy tên màu
                  }
                }
              }
            },
          },
        },
      },
    });

    // Bạn có thể xử lý thêm ở đây nếu cần
    return details;
  }






}
