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
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { Request } from 'express';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { ExportStatus } from '@prisma/client';

@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  // Tạo mới phiếu xuất
  @Post()
  create(@Req() req: Request, @Body() dto: CreateExportDto) {
    const user = req.user as any; // chứa userId từ JWT
    return this.exportService.create(user.id, dto);
  }

  // Lấy danh sách phiếu xuất
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.exportService.findAll(+page, +limit, status, search);
  }

  
  @Get('stats')
  getStats() {
    return this.exportService.getExportStats();
  }

  @Get('total-revenue')
  async getTotalRevenueAccurate(
    @Query('startDate') startDateParam: string,
    @Query('endDate') endDateParam: string,
  ) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based (0 = Jan, 8 = Sep)

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(currentYear, currentMonth, 1, 0, 0, 0, 0); // 1st day of current month

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999); // Last day of current month

    return this.exportService.getTotalRevenueAccurate(startDate, endDate);
  }

  @Get(':id/prepayment-amount')
  getPrepaymentAmount(@Param('id', ParseIntPipe) id: number) {
    return this.exportService.getPrepaymentAmountByExportId(id);
  }
  

  // Lấy chi tiết 1 phiếu xuất
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportService.findOne(+id);
  }



  // Cập nhật phiếu xuất
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExportDto) {
    return this.exportService.update(+id, dto);
  }

  // Xoá phiếu xuất
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exportService.remove(+id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ExportStatus }  // Nhận status và prepaymentId từ body
  ) {
    return this.exportService.updateStatus(id, body.status);  // Truyền vào service
  }


}
