import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ImportStatus, Prisma } from '@prisma/client';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới 1 phiếu nhập
  async create(userId: number, dto: CreateImportDto) {
    const totalAmount = 0;

   const data: any = {
      userId,
      note: dto.note,
      status: dto.status,
      total_amount: totalAmount,
      supplierId: dto.supplierId,
    };

    if (dto.import_date) {
      data.import_date = new Date(dto.import_date);
    }

    if (dto.extra_cost !== undefined) {
      data.extra_cost = dto.extra_cost;
    }

    if (dto.isInternal !== undefined) {
      data.isInternal = dto.isInternal;
    }

    const created = await this.prisma.import.create({
      data: data, 
    });

    return {
      success: true,
      message: 'Tạo phiếu nhập thành công',
      data: created,
    };
  }

  // Lấy danh sách phiếu nhập
    async findAll(page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;

    // Xác định enum trạng thái (nếu có)
    const statusEnum = (status && Object.values(ImportStatus).includes(status as ImportStatus))
        ? (status as ImportStatus)
        : undefined;

    // Điều kiện tìm kiếm
    const whereClause: Prisma.ImportWhereInput = {
        ...(statusEnum && { status: statusEnum }),
        ...(search && {
        OR: [
            { note: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
        }),
    };

    // Lấy dữ liệu phiếu nhập và tính tổng số lượng
    const [items, total] = await this.prisma.$transaction([
        this.prisma.import.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            supplier: true,
            importDetails: {
            include: { product: true },
            },
        },
        }),
        this.prisma.import.count({ where: whereClause }),
    ]);

    // Tính totalAmount cho mỗi phiếu nhập
    const itemsWithTotalAmount = items.map(item => {
        const totalAmount = item.importDetails.reduce((sum, detail) => {
        return sum + (detail.unitPrice * detail.quantity); // Tính tổng số tiền
        }, 0);

        return {
        ...item,
        totalAmount, // Thêm tổng số tiền vào mỗi phiếu nhập
        };
    });

    return {
        success: true,
        message: total > 0 ? 'Danh sách phiếu nhập' : 'Không có phiếu nhập nào',
        data: itemsWithTotalAmount,
        total,
        page,
        pageCount: Math.ceil(total / limit),
    };
    }


  // Lấy chi tiết 1 phiếu nhập
  async findOne(id: number) {
    const found = await this.prisma.import.findUnique({
      where: { id },
      include: {
        user: true,
        importDetails: {
          include: { product: true },
        },
      },
    });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu nhập');
    }

    return {
      success: true,
      message: 'Tìm thấy phiếu nhập',
      data: found,
    };
  }

  // Cập nhật phiếu nhập
  async update(id: number, dto: UpdateImportDto) {
    const found = await this.prisma.import.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu nhập');
    }


    const updated = await this.prisma.import.update({
      where: { id },
      data: {
        note: dto.note ?? found.note,
        status: dto.status ?? found.status,
        supplierId: dto.supplierId ?? found.supplierId,
        import_date: dto.import_date ? new Date(dto.import_date) : found.import_date,
        extra_cost: dto.extra_cost !== undefined ? dto.extra_cost : found.extra_cost,
        isInternal: dto.isInternal !== undefined ? dto.isInternal : found.isInternal,
      },
     
    });

    return {
      success: true,
      message: 'Cập nhật phiếu nhập thành công',
      data: updated,
    };
  }

  // Xoá phiếu nhập
  async remove(id: number) {
    const found = await this.prisma.import.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu nhập');
    }

    await this.prisma.import.delete({ where: { id } });

    return {
      success: true,
      message: 'Đã xoá phiếu nhập',
    };
  }

  async getImportStats() {
    const [total, completed, pending, cancelled] = await this.prisma.$transaction([
      this.prisma.import.count(), // Tổng tất cả
      this.prisma.import.count({ where: { status: 'COMPLETED' } }),
      this.prisma.import.count({ where: { status: 'PENDING' } }),
      this.prisma.import.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      success: true,
      message: 'Thống kê phiếu nhập',
      data: {
        total,
        completed,
        pending,
        cancelled,
      },
    };
  }

  async getTotalImportValueAccurate(startDate: Date, endDate: Date) {
    // Truy vấn các phiếu nhập với ngày nhập kho nằm trong khoảng từ startDate đến endDate
    const imports = await this.prisma.import.findMany({
      where: {
        status: 'COMPLETED',
        import_date: {
          gte: startDate,  // Lọc từ ngày bắt đầu (startDate)
          lte: endDate,    // Lọc đến ngày kết thúc (endDate)
        },
      },
      include: {
        importDetails: true,
      },
    });

    // Tính tổng giá trị nhập kho
    const totalImportValue = imports.reduce((acc, imp) => {
      const totalAmount = imp.importDetails.reduce(
        (sum, detail) => sum + detail.quantity * detail.unitPrice,
        0,
      );

      return acc + totalAmount;
    }, 0);

    return {
      success: true,
      message: 'Tổng giá trị phiếu nhập tính lại chính xác theo khoảng thời gian',
      data: {
        totalImportValue,
      },
    };
  }

   async updateStatus(id: number, status: ImportStatus) {
    // Tìm phiếu nhập với ID
    const found = await this.prisma.import.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException('Không tìm thấy phiếu nhập');
    }

    // Cập nhật trạng thái của phiếu nhập
    const updated = await this.prisma.import.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: 'Cập nhật trạng thái phiếu nhập thành công',
      data: updated,
    };
  }

  async getTotalExtraCostInternal(startDate: Date, endDate: Date) {
  // Lấy tất cả các phiếu nhập thỏa điều kiện: isInternal = true, import_date trong khoảng
  const imports = await this.prisma.import.findMany({
    where: {
      isInternal: true,
      import_date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      extra_cost: true,
    },
  });

  // Tính tổng extra_cost, nếu extra_cost null hoặc undefined thì tính là 0
  const totalExtraCost = imports.reduce((acc, imp) => {
    return acc + (imp.extra_cost ?? 0);
  }, 0);

  return {
    success: true,
    message: 'Tổng chi phí phát sinh của phiếu nhập đổi trả trong khoảng thời gian',
    data: {
      totalExtraCost,
    },
  };
}
}
