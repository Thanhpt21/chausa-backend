import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@Controller('salaries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: number,
  ) {
    return this.salaryService.findAll(+page, +limit, year, month, status, employeeId);
  }

  @Get('all')
  findAllWithoutPagination(
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: number,
  ) {
    return this.salaryService.findAllWithoutPagination(year, month, status, employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.salaryService.update(+id, updateSalaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salaryService.remove(+id);
  }

  // Báo cáo và thống kê
  @Get('report/summary')
  getSalarySummary(
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return this.salaryService.getSalarySummary(year, month);
  }

  @Get('report/monthly')
  getMonthlyReport(
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.salaryService.getMonthlyReport(year, month);
  }

  @Get('report/employee/:employeeId')
  getEmployeeSalaryReport(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.salaryService.getEmployeeSalaryReport(+employeeId, year);
  }
}