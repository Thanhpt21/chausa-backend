import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryDto) {
    // Kiểm tra sản phẩm tồn tại (productId phải hợp lệ)
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${dto.productId} không tồn tại.`);
    }

    // Tạo bản ghi Inventory mới
    const newInventory = await this.prisma.inventory.create({
      data: {
        productId: dto.productId,
        quantity: dto.quantity,
        lastUpdate: new Date(),
      },
    });

    return {
      success: true,
      message: 'Inventory đã được tạo thành công',
      data: newInventory,
    };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventory.findMany({
        skip,
        take: limit,
        orderBy: { lastUpdate: 'desc' },
        include: { 
        product: {
          select: {
            id: true,     // Lấy trường id
            title: true,  // Lấy trường title
          },
        },
      },
      }),
      this.prisma.inventory.count(),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Inventory items found' : 'No inventory found',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return {
      success: true,
      message: 'Inventory found successfully',
      data: inventory,
    };
  }

  async update(id: number, dto: UpdateInventoryDto) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Nếu có thay đổi productId, kiểm tra sản phẩm đó có tồn tại không
    if (dto.productId && dto.productId !== inventory.productId) {
      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${dto.productId} không tồn tại.`);
      }
    }

    const updatedInventory = await this.prisma.inventory.update({
      where: { id },
      data: {
        productId: dto.productId ?? inventory.productId,
        quantity: dto.quantity ?? inventory.quantity,
        lastUpdate: new Date(),
      },
    });

    return {
      success: true,
      message: 'Inventory đã được cập nhật thành công',
      data: updatedInventory,
    };
  }

  async remove(id: number) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    await this.prisma.inventory.delete({ where: { id } });

    return {
      success: true,
      message: 'Inventory đã được xóa thành công',
    };
  }

  async findByProductId(productId: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      select: {
        quantity: true,
        lastUpdate: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory cho sản phẩm với ID ${productId} không tồn tại.`);
    }

    return {
      success: true,
      message: 'Inventory tìm thấy thành công',
      data: inventory,
    };
  }

async getTotalQuantityForProduct(productId: number): Promise<{ totalQuantity: number, lastUpdate: string | null }> {
  // Lấy thông tin tồn kho của sản phẩm
  const inventory = await this.prisma.inventory.findUnique({
    where: { productId },
    select: { quantity: true, lastUpdate: true },
  });

  // Nếu không có thông tin tồn kho
  if (!inventory) {
    return {
      totalQuantity: 0,
      lastUpdate: null,
    };
  }

  // Lấy tổng số lượng từ các chi tiết phiếu nhập có status là 'COMPLETED'
  const importDetails = await this.prisma.importDetail.aggregate({
    _sum: { quantity: true },
    where: {
      productId,
      import: { status: 'COMPLETED' },  // Điều kiện chỉ tính khi status của import là 'COMPLETED'
    },
  });

  // Tổng số lượng = số lượng trong kho + số lượng từ các phiếu nhập có trạng thái 'COMPLETED'
  const totalQuantity = (importDetails._sum.quantity || 0);

  return {
    totalQuantity,
    lastUpdate: inventory.lastUpdate ? inventory.lastUpdate.toISOString() : null,
  };
}




}
