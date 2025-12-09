import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { Prisma, SalaryStatus } from '@prisma/client';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { CreateSalaryDto } from './dto/create-salary.dto';

@Injectable()
export class SalaryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSalaryDto) {
    // Kiểm tra nhân viên tồn tại
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    // Kiểm tra bảng lương đã tồn tại cho tháng này chưa
    const existingSalary = await this.prisma.salary.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: dto.employeeId,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    if (existingSalary) {
      throw new BadRequestException(`Bảng lương tháng ${dto.month}/${dto.year} đã tồn tại`);
    }

    try {
      const salary = await this.prisma.salary.create({
        data: {
          employeeId: dto.employeeId,
          month: dto.month,
          year: dto.year,
          baseSalary: dto.baseSalary,
          actualWorkDays: dto.actualWorkDays,
          totalWorkHours: dto.totalWorkHours ?? 0,
          overtimeHours: dto.overtimeHours ?? 0,
          overtimeAmount: dto.overtimeAmount ?? 0,
          leaveDays: dto.leaveDays ?? 0,
          leaveHours: dto.leaveHours ?? 0,
          bonus: dto.bonus ?? 0,
          deduction: dto.deduction ?? 0,
          allowance: dto.allowance ?? 0,
          netSalary: dto.netSalary,
          status: dto.status ?? SalaryStatus.PENDING,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
          notes: dto.notes ?? null,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              position: true,
              department: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Bảng lương đã được tạo thành công',
        data: salary,
      };
    } catch (error) {
      throw new BadRequestException('Không thể tạo bảng lương: ' + error.message);
    }
  }

  async findAll(page = 1, limit = 10, year?: number, month?: number, status?: string, employeeId?: number) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SalaryWhereInput = {};

    if (year) {
      whereClause.year = year;
    }

    if (month) {
      whereClause.month = month;
    }

    if (status) {
      whereClause.status = status as SalaryStatus;
    }

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.salary.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              position: true,
              department: true,
            },
          },
        },
      }),
      this.prisma.salary.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách bảng lương' : 'Không có bảng lương nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findAllWithoutPagination(year?: number, month?: number, status?: string, employeeId?: number) {
    const whereClause: Prisma.SalaryWhereInput = {};

    if (year) {
      whereClause.year = year;
    }

    if (month) {
      whereClause.month = month;
    }

    if (status) {
      whereClause.status = status as SalaryStatus;
    }

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const items = await this.prisma.salary.findMany({
      where: whereClause,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true,
          },
        },
      },
    });

    return {
      success: true,
      message: items.length > 0 ? 'Danh sách bảng lương' : 'Không có bảng lương nào',
      data: items,
      total: items.length,
    };
  }

  async findOne(id: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true,
            baseSalary: true,
            bankName: true,
            bankAccount: true,
            bankAccountName: true,
          },
        },
      },
    });

    if (!salary) {
      throw new NotFoundException('Không tìm thấy bảng lương');
    }

    return {
      success: true,
      message: 'Tìm thấy bảng lương',
      data: salary,
    };
  }

  async update(id: number, dto: UpdateSalaryDto) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
    });

    if (!salary) {
      throw new NotFoundException('Không tìm thấy bảng lương');
    }

    // Nếu cập nhật employeeId, kiểm tra employee mới có tồn tại không
    if (dto.employeeId && dto.employeeId !== salary.employeeId) {
      const newEmployee = await this.prisma.employee.findUnique({
        where: { id: dto.employeeId },
      });

      if (!newEmployee) {
        throw new NotFoundException('Không tìm thấy nhân viên mới');
      }

      // Kiểm tra nếu đã có lương cho tháng này của employee mới
      if (dto.month || dto.year) {
        const checkMonth = dto.month || salary.month;
        const checkYear = dto.year || salary.year;

        const existingSalary = await this.prisma.salary.findUnique({
          where: {
            employeeId_month_year: {
              employeeId: dto.employeeId,
              month: checkMonth,
              year: checkYear,
            },
          },
        });

        if (existingSalary && existingSalary.id !== id) {
          throw new BadRequestException(`Nhân viên này đã có bảng lương tháng ${checkMonth}/${checkYear}`);
        }
      }
    }

    const updateData: any = {};

    if (dto.employeeId !== undefined) updateData.employeeId = dto.employeeId;
    if (dto.month !== undefined) updateData.month = dto.month;
    if (dto.year !== undefined) updateData.year = dto.year;
    if (dto.baseSalary !== undefined) updateData.baseSalary = dto.baseSalary;
    if (dto.actualWorkDays !== undefined) updateData.actualWorkDays = dto.actualWorkDays;
    if (dto.totalWorkHours !== undefined) updateData.totalWorkHours = dto.totalWorkHours;
    if (dto.overtimeHours !== undefined) updateData.overtimeHours = dto.overtimeHours;
    if (dto.overtimeAmount !== undefined) updateData.overtimeAmount = dto.overtimeAmount;
    if (dto.leaveDays !== undefined) updateData.leaveDays = dto.leaveDays;
    if (dto.leaveHours !== undefined) updateData.leaveHours = dto.leaveHours;
    if (dto.bonus !== undefined) updateData.bonus = dto.bonus;
    if (dto.deduction !== undefined) updateData.deduction = dto.deduction;
    if (dto.allowance !== undefined) updateData.allowance = dto.allowance;
    if (dto.netSalary !== undefined) updateData.netSalary = dto.netSalary;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.paymentDate !== undefined) updateData.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : null;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.salary.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Bảng lương đã được cập nhật',
      data: updated,
    };
  }

  async remove(id: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { id },
    });

    if (!salary) {
      throw new NotFoundException('Không tìm thấy bảng lương');
    }

    await this.prisma.salary.delete({ where: { id } });

    return {
      success: true,
      message: 'Bảng lương đã được xóa',
    };
  }

async getSalarySummary(year: number, month?: number) {
  const whereClause: Prisma.SalaryWhereInput = {
    year,
  };

  if (month) {
    whereClause.month = month;
  }

  const salaries = await this.prisma.salary.findMany({
    where: whereClause,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: [{ employee: { department: 'asc' } }, { employee: { name: 'asc' } }],
  });

  const totalEmployees = await this.prisma.employee.count({
    where: { isActive: true },
  });

  const totalPaid = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);
  const totalBonus = salaries.reduce((sum, salary) => sum + salary.bonus, 0);
  const totalOvertime = salaries.reduce((sum, salary) => sum + salary.overtimeAmount, 0);
  const totalDeduction = salaries.reduce((sum, salary) => sum + salary.deduction, 0);

  // ✅ SỬA: Thêm kiểm tra null cho department
  const departmentStats: Record<string, { count: number; total: number }> = {};
  
  salaries.forEach(salary => {
    const dept = salary.employee.department || 'Không xác định'; // ✅ Xử lý null
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, total: 0 };
    }
    departmentStats[dept].count += 1;
    departmentStats[dept].total += salary.netSalary;
  });

  return {
    success: true,
    message: 'Thống kê bảng lương',
    data: {
      summary: {
        year,
        month,
        totalEmployees,
        totalSalaries: salaries.length,
        totalPaid,
        totalBonus,
        totalOvertime,
        totalDeduction,
        averageSalary: salaries.length > 0 ? totalPaid / salaries.length : 0,
      },
      departmentStats,
      salaries: salaries.map(s => ({
        id: s.id,
        employeeId: s.employee.id,
        employeeName: s.employee.name,
        department: s.employee.department || 'Không xác định', // ✅ Xử lý null
        month: s.month,
        year: s.year,
        baseSalary: s.baseSalary,
        netSalary: s.netSalary,
        status: s.status,
        paymentDate: s.paymentDate,
      })),
    },
  };
}

  async getMonthlyReport(year: number, month: number) {
    const salaries = await this.prisma.salary.findMany({
      where: {
        year,
        month,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true,
            bankName: true,
            bankAccount: true,
            bankAccountName: true,
          },
        },
      },
      orderBy: [{ employee: { department: 'asc' } }, { employee: { name: 'asc' } }],
    });

    if (salaries.length === 0) {
      return {
        success: true,
        message: `Không có bảng lương cho tháng ${month}/${year}`,
        data: {
          year,
          month,
          totalEmployees: 0,
          totalAmount: 0,
          salaries: [],
        },
      };
    }

    const totalAmount = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);

    return {
      success: true,
      message: `Báo cáo lương tháng ${month}/${year}`,
      data: {
        year,
        month,
        totalEmployees: salaries.length,
        totalAmount,
        salaries: salaries.map(s => ({
          id: s.id,
          employeeId: s.employee.id,
          employeeName: s.employee.name,
          position: s.employee.position,
          department: s.employee.department,
          baseSalary: s.baseSalary,
          actualWorkDays: s.actualWorkDays,
          overtimeHours: s.overtimeHours,
          overtimeAmount: s.overtimeAmount,
          leaveDays: s.leaveDays,
          bonus: s.bonus,
          deduction: s.deduction,
          allowance: s.allowance,
          netSalary: s.netSalary,
          status: s.status,
          paymentDate: s.paymentDate,
          bankName: s.employee.bankName,
          bankAccount: s.employee.bankAccount,
          bankAccountName: s.employee.bankAccountName,
          notes: s.notes,
        })),
      },
    };
  }

  async getEmployeeSalaryReport(employeeId: number, year?: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const whereClause: Prisma.SalaryWhereInput = {
      employeeId,
    };

    if (year) {
      whereClause.year = year;
    }

    const salaries = await this.prisma.salary.findMany({
      where: whereClause,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Thống kê theo năm
    const yearlyStats: Record<number, { total: number; count: number }> = {};
    
    salaries.forEach(salary => {
      const year = salary.year;
      if (!yearlyStats[year]) {
        yearlyStats[year] = { total: 0, count: 0 };
      }
      yearlyStats[year].total += salary.netSalary;
      yearlyStats[year].count += 1;
    });

    // Tính tổng
    const totalAmount = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const averageMonthly = salaries.length > 0 ? totalAmount / salaries.length : 0;

    return {
      success: true,
      message: 'Báo cáo lương nhân viên',
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          position: employee.position,
          department: employee.department,
          baseSalary: employee.baseSalary,
          startDate: employee.startDate,
        },
        summary: {
          totalSalaries: salaries.length,
          totalAmount,
          averageMonthly,
        },
        yearlyStats: Object.entries(yearlyStats).map(([year, stats]) => ({
          year: parseInt(year),
          total: stats.total,
          count: stats.count,
          average: stats.total / stats.count,
        })),
        salaries: salaries.map(s => ({
          id: s.id,
          month: s.month,
          year: s.year,
          baseSalary: s.baseSalary,
          actualWorkDays: s.actualWorkDays,
          overtimeHours: s.overtimeHours,
          overtimeAmount: s.overtimeAmount,
          leaveDays: s.leaveDays,
          bonus: s.bonus,
          deduction: s.deduction,
          allowance: s.allowance,
          netSalary: s.netSalary,
          status: s.status,
          paymentDate: s.paymentDate,
        })),
      },
    };
  }
}