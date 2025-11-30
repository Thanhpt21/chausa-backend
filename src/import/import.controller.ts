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
import { ImportService } from './import.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { Request } from 'express';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { ImportStatus } from '@prisma/client';

@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  // Tạo mới phiếu nhập
  @Post()
  create(@Req() req: Request, @Body() dto: CreateImportDto) {
    const user = req.user as any; // chứa userId từ JWT
    return this.importService.create(user.id, dto);
  }

  // Lấy danh sách phiếu nhập
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.importService.findAll(+page, +limit, status, search);
  }

   @Get('/stats')
  getImportStats() {
    return this.importService.getImportStats();
  }

  @Get('total-value')
  async getTotalImportValue(
    @Query('startDate') startDateParam: string,
    @Query('endDate') endDateParam: string,
  ) {
    // Nếu không truyền ngày, sử dụng ngày hiện tại (default)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Nếu startDate và endDate không được truyền, mặc định là ngày đầu và cuối tháng hiện tại
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(currentYear, 0, 1, 0, 0, 0, 0);

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Gọi hàm từ service với startDate và endDate
    return this.importService.getTotalImportValueAccurate(startDate, endDate);
  }

  @Get('total-extra-cost')
  async getTotalExtraCostInternal(
    @Query('startDate') startDateParam: string,
    @Query('endDate') endDateParam: string,
  ) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Tháng hiện tại (0-11)

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(currentYear, currentMonth, 1, 0, 0, 0, 0); // Ngày đầu tháng

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999); // Ngày cuối tháng

    return this.importService.getTotalExtraCostInternal(startDate, endDate);
  }

  // Lấy chi tiết 1 phiếu nhập
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importService.findOne(+id);
  }

  // Cập nhật phiếu nhập
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateImportDto) {
    return this.importService.update(+id, dto);
  }

  // Xoá phiếu nhập
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importService.remove(+id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number, // ParseIntPipe giúp tự động parse id từ param thành kiểu number
    @Body('status') status: ImportStatus, // Nhận status từ body
  ) {
    return this.importService.updateStatus(id, status); // Gọi service để cập nhật trạng thái
  }
 
}
