import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Prisma, SalaryStatus } from '@prisma/client';
import { CreateSalaryDto } from 'src/salary/dto/create-salary.dto';
import { UpdateSalaryDto } from 'src/salary/dto/update-salary.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  // ========== EMPLOYEE METHODS ==========

  async create(dto: CreateEmployeeDto) {
    try {
      const employee = await this.prisma.employee.create({
        data: {
          name: dto.name,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
          position: dto.position ?? null,
          department: dto.department ?? null,
          baseSalary: dto.baseSalary,
          salaryCurrency: dto.salaryCurrency ?? 'VND',
          startDate: new Date(dto.startDate),
          isActive: dto.isActive ?? true,
          bankName: dto.bankName ?? null,
          bankAccount: dto.bankAccount ?? null,
          bankAccountName: dto.bankAccountName ?? null,
          note: dto.note ?? null,
        },
      });

      return {
        success: true,
        message: 'Nhân viên đã được tạo thành công',
        data: employee,
      };
    } catch (error) {
      throw new BadRequestException('Không thể tạo nhân viên: ' + error.message);
    }
  }

  async findAll(page = 1, limit = 10, search = '', department = '', isActive?: boolean) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.EmployeeWhereInput = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      whereClause.department = { equals: department, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          _count: {
            select: {
              salaries: true,
            },
          },
        },
      }),
      this.prisma.employee.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Danh sách nhân viên' : 'Không có nhân viên nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findAllWithoutPagination(search = '', department = '', isActive?: boolean) {
    const whereClause: Prisma.EmployeeWhereInput = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      whereClause.department = { equals: department, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const items = await this.prisma.employee.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        baseSalary: true,
        isActive: true,
      },
    });

    return {
      success: true,
      message: items.length > 0 ? 'Danh sách nhân viên' : 'Không có nhân viên nào',
      data: items,
      total: items.length,
    };
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        salaries: {
          take: 5,
          orderBy: { year: 'desc', month: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return {
      success: true,
      message: 'Tìm thấy nhân viên',
      data: employee,
    };
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.department !== undefined) updateData.department = dto.department;
    if (dto.baseSalary !== undefined) updateData.baseSalary = dto.baseSalary;
    if (dto.salaryCurrency !== undefined) updateData.salaryCurrency = dto.salaryCurrency;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.bankName !== undefined) updateData.bankName = dto.bankName;
    if (dto.bankAccount !== undefined) updateData.bankAccount = dto.bankAccount;
    if (dto.bankAccountName !== undefined) updateData.bankAccountName = dto.bankAccountName;
    if (dto.note !== undefined) updateData.note = dto.note;

    const updated = await this.prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Nhân viên đã được cập nhật',
      data: updated,
    };
  }

  async remove(id: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    // Kiểm tra xem nhân viên có bảng lương nào không
    const salaryCount = await this.prisma.salary.count({
      where: { employeeId: id },
    });

    if (salaryCount > 0) {
      throw new BadRequestException('Không thể xóa nhân viên đã có bảng lương. Vui lòng xóa bảng lương trước.');
    }

    await this.prisma.employee.delete({ where: { id } });

    return {
      success: true,
      message: 'Nhân viên đã được xóa',
    };
  }

  // ========== SALARY METHODS ==========

  async createSalary(employeeId: number, dto: CreateSalaryDto) {
    // Kiểm tra nhân viên tồn tại
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    // Kiểm tra bảng lương đã tồn tại cho tháng này chưa
    const existingSalary = await this.prisma.salary.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
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
          employeeId,
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

  async getEmployeeSalaries(employeeId: number, page = 1, limit = 10, year?: number, month?: number) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SalaryWhereInput = {
      employeeId,
    };

    if (year) {
      whereClause.year = year;
    }

    if (month) {
      whereClause.month = month;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.salary.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
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

  async getAllSalaries(page = 1, limit = 10, year?: number, month?: number, status?: string) {
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
      message: total > 0 ? 'Danh sách tất cả bảng lương' : 'Không có bảng lương nào',
      data: items,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async getSalary(salaryId: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { id: salaryId },
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

  async updateSalary(salaryId: number, dto: UpdateSalaryDto) {
    const salary = await this.prisma.salary.findUnique({
      where: { id: salaryId },
    });

    if (!salary) {
      throw new NotFoundException('Không tìm thấy bảng lương');
    }

    const updateData: any = {};

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
      where: { id: salaryId },
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

  async removeSalary(salaryId: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { id: salaryId },
    });

    if (!salary) {
      throw new NotFoundException('Không tìm thấy bảng lương');
    }

    await this.prisma.salary.delete({ where: { id: salaryId } });

    return {
      success: true,
      message: 'Bảng lương đã được xóa',
    };
  }

  // ========== REPORT METHODS ==========

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
}