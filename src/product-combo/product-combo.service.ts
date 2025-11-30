// src/product-combo/product-combo.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AddProductToComboDto } from './dto/add-product-to-combo.dto';
import { UpdateProductInComboDto } from './dto/update-product-in-combo.dto';

@Injectable()
export class ProductComboService {
  constructor(private readonly prisma: PrismaService) {}

  // Thêm sản phẩm vào combo
  async add(comboId: number, dto: AddProductToComboDto) {
    const data: Prisma.ComboProductUncheckedCreateInput = { // <--- chỉnh type đúng
      comboId,
      productId: dto.productId,
      quantity: dto.quantity ?? 1,
      unitPrice: dto.unitPrice ?? 0,
      color: dto.color ?? 0,
      colorTitle: dto.colorTitle ?? '',
      unit: dto.unit ?? 'cái',
      finalPrice: dto.finalPrice ?? 0,
      note: dto.note ?? '',
    };

    const created = await this.prisma.comboProduct.create({ // <--- chỉnh tên đúng
      data,
      include: { product: true },
    });

    return {
      success: true,
      message: 'Thêm sản phẩm vào combo thành công',
      data: created,
    };
  }

  // Lấy danh sách sản phẩm trong combo
  async findAll(comboId: number) {
    const products = await this.prisma.comboProduct.findMany({ // <--- tên đúng
      where: { comboId },
      include: { product: true },
    });

    return {
      success: true,
      message: products.length > 0 ? 'Danh sách sản phẩm trong combo' : 'Combo chưa có sản phẩm nào',
      data: products,
      total: products.length,
    };
  }

  // Lấy 1 sản phẩm cụ thể trong combo
  async findOne(comboId: number, productId: number) {
    const found = await this.prisma.comboProduct.findUnique({
      where: { comboId_productId: { comboId, productId } },
      include: { product: true },
    });

    if (!found) throw new NotFoundException('Không tìm thấy sản phẩm trong combo');

    return {
      success: true,
      message: 'Tìm thấy sản phẩm trong combo',
      data: found,
    };
  }

  // Cập nhật sản phẩm trong combo
  async update(comboId: number, productId: number, dto: UpdateProductInComboDto) {
    const found = await this.prisma.comboProduct.findUnique({
      where: { comboId_productId: { comboId, productId } },
    });

    if (!found) throw new NotFoundException('Không tìm thấy sản phẩm trong combo');

    const updated = await this.prisma.comboProduct.update({
      where: { comboId_productId: { comboId, productId } },
      data: {
        quantity: dto.quantity ?? found.quantity,
        unitPrice: dto.unitPrice ?? found.unitPrice,
        color: dto.color ?? found.color,
        colorTitle: dto.colorTitle ?? found.colorTitle,
        unit: dto.unit ?? found.unit,
        finalPrice: dto.finalPrice ?? found.finalPrice,
        note: dto.note ?? found.note,
      },
    });

    return {
      success: true,
      message: 'Cập nhật sản phẩm trong combo thành công',
      data: updated,
    };
  }

  // Xóa sản phẩm khỏi combo
  async remove(comboId: number, productId: number) {
    const found = await this.prisma.comboProduct.findUnique({
      where: { comboId_productId: { comboId, productId } },
    });

    if (!found) throw new NotFoundException('Không tìm thấy sản phẩm trong combo');

    await this.prisma.comboProduct.delete({
      where: { comboId_productId: { comboId, productId } },
    });

    return {
      success: true,
      message: 'Xóa sản phẩm khỏi combo thành công',
    };
  }
}
