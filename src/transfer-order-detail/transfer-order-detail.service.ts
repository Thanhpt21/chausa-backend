import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTransferOrderDetailDto } from './dto/create-transfer-order-detail.dto';
import { UpdateTransferOrderDetailDto } from './dto/update-transfer-order-detail.dto';

@Injectable()
export class TransferOrderDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransferOrderDetailDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const created = await this.prisma.transferOrderDetail.create({ data: dto });

    return {
      success: true,
      message: 'Tạo chi tiết đơn đặt thành công',
      data: created,
    };
  }

  async findOne(id: number) {
    const found = await this.prisma.transferOrderDetail.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy chi tiết đơn đặt');
    return { success: true, message: 'Chi tiết đơn đặt', data: found };
  }

  async update(id: number, dto: UpdateTransferOrderDetailDto) {
    const existing = await this.prisma.transferOrderDetail.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy chi tiết đơn đặt');

    const updated = await this.prisma.transferOrderDetail.update({
      where: { id },
      data: { ...dto },
    });

    return { success: true, message: 'Cập nhật chi tiết đơn đặt thành công', data: updated };
  }

  async remove(id: number) {
    const existing = await this.prisma.transferOrderDetail.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy chi tiết đơn đặt');

    await this.prisma.transferOrderDetail.delete({ where: { id } });
    return { success: true, message: 'Xoá chi tiết đơn đặt thành công' };
  }

  async findByTransferId(transferId: number) {
    const details = await this.prisma.transferOrderDetail.findMany({
      where: { transferId },
      include: {
        product: { select: { title: true, sku: true } },
      },
    });

    return details;
  }
}
