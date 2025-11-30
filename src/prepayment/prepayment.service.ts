import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePrepaymentDto } from './dto/create-prepayment.dto';
import { UpdatePrepaymentDto } from './dto/update-prepayment.dto';
import { PrepaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PrepaymentService {
  constructor(private prisma: PrismaService) {}

  // Tạo Prepayment
  async create(dto: CreatePrepaymentDto) {
    // Kiểm tra khách hàng có tồn tại hay không
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Khách hàng với ID ${dto.customerId} không tồn tại.`);
    }

      // Kiểm tra nếu dto.date có giá trị hợp lệ
  let date: Date;

  if (dto.date && !isNaN(Date.parse(dto.date))) {
    // Nếu dto.date là chuỗi hợp lệ thì chuyển đổi thành đối tượng Date
    date = new Date(dto.date);
  } else {
    // Nếu dto.date không hợp lệ, tạo ngày giờ hiện tại
    date = new Date();
  }

    // Tạo bản ghi Prepayment mới
    const newPrepayment = await this.prisma.prepayment.create({
      data: {
        customerId: dto.customerId,
        amountMoney: dto.amountMoney,
        date,
        note: dto.note || '',
        status: 'PENDING',
      },
    });

    return {
      success: true,
      message: 'Prepayment đã được tạo thành công',
      data: newPrepayment,
    };
  }

  // Lấy danh sách Prepayment, hỗ trợ phân trang
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.prepayment.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { customer: true }, // Lấy luôn thông tin khách hàng
      }),
      this.prisma.prepayment.count(),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách Prepayment đã được tìm thấy' : 'Không có Prepayment nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Lấy một bản ghi Prepayment theo ID
  async findOne(id: number) {
    const prepayment = await this.prisma.prepayment.findUnique({
      where: { id },
      include: { customer: true },  // Lấy thông tin khách hàng
    });

    if (!prepayment) {
      throw new NotFoundException('Prepayment không tồn tại');
    }

    return {
      success: true,
      message: 'Prepayment tìm thấy thành công',
      data: prepayment,
    };
  }

  // Cập nhật Prepayment
  async update(id: number, dto: UpdatePrepaymentDto) {
    const prepayment = await this.prisma.prepayment.findUnique({ where: { id } });
    if (!prepayment) {
      throw new NotFoundException('Prepayment không tồn tại');
    }

    // Nếu có thay đổi customerId, kiểm tra khách hàng đó có tồn tại không
    if (dto.customerId && dto.customerId !== prepayment.customerId) {
      const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
      if (!customer) {
        throw new NotFoundException(`Khách hàng với ID ${dto.customerId} không tồn tại.`);
      }
    }

    const updatedPrepayment = await this.prisma.prepayment.update({
      where: { id },
      data: {
        customerId: dto.customerId ?? prepayment.customerId,
        amountMoney: dto.amountMoney ?? prepayment.amountMoney,
        status: dto.status ?? prepayment.status,
        date: dto.date ? new Date(dto.date) : prepayment.date,
        note: dto.note ?? prepayment.note,
      },
    });

    return {
      success: true,
      message: 'Prepayment đã được cập nhật thành công',
      data: updatedPrepayment,
    };
  }

  // Xóa Prepayment
  async remove(id: number) {
    const prepayment = await this.prisma.prepayment.findUnique({ where: { id } });
    if (!prepayment) {
      throw new NotFoundException('Prepayment không tồn tại');
    }

    await this.prisma.prepayment.delete({ where: { id } });

    return {
      success: true,
      message: 'Prepayment đã được xóa thành công',
    };
  }

  // Tìm Prepayment theo customerId
  async findByCustomerId(customerId: number) {
    const prepayments = await this.prisma.prepayment.findMany({
      where: { customerId },
      orderBy: { date: 'desc' },
    });

    if (!prepayments.length) {
      throw new NotFoundException(`Không tìm thấy Prepayment cho khách hàng với ID ${customerId}`);
    }

    return {
      success: true,
      message: 'Prepayment của khách hàng tìm thấy thành công',
      data: prepayments,
    };
  }
  // Lấy tổng số tiền Prepayment cho một khách hàng
  async getTotalAmountForCustomer(customerId: number): Promise<{ totalAmount: number; lastUpdate: string | null; message: string | null }> {
    // Tính tổng số tiền thanh toán hợp lệ
    const prepayments = await this.prisma.prepayment.aggregate({
      _sum: { amountMoney: true },
      where: {
        customerId,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'], // Loại trừ trạng thái 'CANCELLED' và 'COMPLETED'
        },
      },
    });

    const totalAmount = prepayments._sum.amountMoney || 0;

    // Nếu không có giao dịch hợp lệ
    if (totalAmount === 0) {
      return {
        totalAmount,
        lastUpdate: null,
        message: 'Không có giao dịch thanh toán hợp lệ (Chưa hoàn thành hoặc bị hủy).', // Thông báo không có giao dịch hợp lệ
      };
    }

    // Lấy thông tin lần cập nhật cuối cùng
    const lastUpdate = await this.prisma.prepayment.findFirst({
      where: {
        customerId,
        status: { notIn: ['CANCELLED', 'COMPLETED'] }, // Loại trừ trạng thái 'CANCELLED' và 'COMPLETED'
      },
      orderBy: { date: 'desc' },
      select: { date: true }, // Lấy chỉ trường `date`
    });

    // Nếu có giao dịch hợp lệ, trả về thông tin
    return {
      totalAmount,
      lastUpdate: lastUpdate ? lastUpdate.date.toISOString() : null, // Chuyển đổi `lastUpdate.date` thành dạng ISO string nếu có
      message: null, // Không có thông báo lỗi nếu có giao dịch hợp lệ
    };
  }

async getTotalPrepaymentSum(startDate?: Date, endDate?: Date) {
  const whereClause: Prisma.PrepaymentWhereInput = {
    status: {
      notIn: ['COMPLETED', 'CANCELLED'],
    },
    ...(startDate && endDate && {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }),
  };

  const result = await this.prisma.prepayment.aggregate({
    _sum: {
      amountMoney: true,
    },
    where: whereClause,
  });

  const totalAmount = result._sum.amountMoney || 0;

  return {
    success: true,
    message: `Tổng số tiền của các khoản tạm ứng chưa hoàn thành${startDate && endDate ? ' trong khoảng thời gian' : ''} đã được tính.`,
    data: {
      totalAmount,
    },
  };
}

  async updateStatus(id: number, newStatus: PrepaymentStatus) {
    const prepayment = await this.prisma.prepayment.findUnique({ where: { id } });
    if (!prepayment) {
      throw new NotFoundException('Prepayment không tồn tại.');
    }
    const updatedPrepayment = await this.prisma.prepayment.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });

    return {
      success: true,
      message: `Trạng thái Prepayment ID ${id} đã được cập nhật thành ${newStatus}.`,
      data: updatedPrepayment,
    };
  }

}
