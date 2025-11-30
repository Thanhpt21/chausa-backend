import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, PurchaseRequestDetail } from '@prisma/client';
import { CreatePurchaseRequestDetailDto } from './dto/create-purchase-request-detail.dto';
import { UpdatePurchaseRequestDetailDto } from './dto/update-purchase-request-detail.dto';

@Injectable()
export class PurchaseRequestDetailService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới chi tiết phiếu yêu cầu mua hàng
  async create(dto: CreatePurchaseRequestDetailDto): Promise<{ success: boolean; message: string; data: PurchaseRequestDetail }> {
    const created = await this.prisma.purchaseRequestDetail.create({
      data: {
        purchaseRequestId: dto.purchaseRequestId,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        color: dto.color,
        colorTitle: dto.colorTitle,
        size: dto.size,
      },
    });

    // Tính lại tổng tiền của phiếu yêu cầu mua hàng
    const details = await this.prisma.purchaseRequestDetail.findMany({
      where: { purchaseRequestId: dto.purchaseRequestId },
    });

    const totalAmount = details.reduce((total, detail) => total + detail.quantity * detail.unitPrice, 0);

    // Cập nhật tổng tiền cho phiếu yêu cầu mua hàng
    await this.prisma.purchaseRequest.update({
      where: { id: dto.purchaseRequestId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Tạo chi tiết phiếu yêu cầu mua hàng thành công và cập nhật lại tổng tiền.',
      data: created,
    };
  }

  // Cập nhật chi tiết phiếu yêu cầu mua hàng
  async update(id: number, dto: UpdatePurchaseRequestDetailDto): Promise<{ success: boolean; message: string; data: PurchaseRequestDetail }> {
    const found = await this.prisma.purchaseRequestDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu yêu cầu mua hàng');
    }

    const updated = await this.prisma.purchaseRequestDetail.update({
      where: { id },
      data: {
        purchaseRequestId: dto.purchaseRequestId ?? found.purchaseRequestId,
        productId: dto.productId ?? found.productId,
        quantity: dto.quantity ?? found.quantity,
        unitPrice: dto.unitPrice ?? found.unitPrice,
        color: dto.color ?? found.color,
        colorTitle: dto.colorTitle ?? found.colorTitle,
        size: dto.size ?? found.size, 
      },
    });

    // Tính lại tổng tiền của phiếu yêu cầu mua hàng
    const details = await this.prisma.purchaseRequestDetail.findMany({
      where: { purchaseRequestId: updated.purchaseRequestId },
    });

    const totalAmount = details.reduce((total, detail) => total + detail.quantity * detail.unitPrice, 0);

    await this.prisma.purchaseRequest.update({
      where: { id: updated.purchaseRequestId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Cập nhật chi tiết phiếu yêu cầu mua hàng thành công và cập nhật lại tổng tiền.',
      data: updated,
    };
  }

  // Lấy chi tiết phiếu yêu cầu mua hàng theo id
  async findOne(id: number): Promise<{ success: boolean; message: string; data: PurchaseRequestDetail }> {
    const found = await this.prisma.purchaseRequestDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu yêu cầu mua hàng');
    }

    return {
      success: true,
      message: 'Tìm thấy chi tiết phiếu yêu cầu mua hàng',
      data: found,
    };
  }

  // Xóa chi tiết phiếu yêu cầu mua hàng
  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const found = await this.prisma.purchaseRequestDetail.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy chi tiết phiếu yêu cầu mua hàng');
    }

    await this.prisma.purchaseRequestDetail.delete({ where: { id } });

    // Tính lại tổng tiền sau khi xóa chi tiết
    const details = await this.prisma.purchaseRequestDetail.findMany({
      where: { purchaseRequestId: found.purchaseRequestId },
    });

    const totalAmount = details.reduce((total, detail) => total + detail.quantity * detail.unitPrice, 0);

    await this.prisma.purchaseRequest.update({
      where: { id: found.purchaseRequestId },
      data: { total_amount: totalAmount },
    });

    return {
      success: true,
      message: 'Đã xóa chi tiết phiếu yêu cầu mua hàng và cập nhật lại tổng tiền.',
    };
  }

  // Lấy danh sách chi tiết theo purchaseRequestId
  async findByPurchaseRequestId(purchaseRequestId: number) {
    const details = await this.prisma.purchaseRequestDetail.findMany({
      where: { purchaseRequestId },
      include: {
        product: {
          select: {
            title: true,
            sku: true,
            // Nếu có quan hệ màu sắc hoặc khác thì thêm vào đây
          },
        },
      },
    });

    return details;
  }
}
