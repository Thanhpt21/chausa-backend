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
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { Request } from 'express';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferStatus } from '@prisma/client';

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  // Tạo mới phiếu chuyển kho
  @Post()
  create(@Req() req: Request, @Body() dto: CreateTransferDto) {
    const user = req.user as any; // lấy userId từ JWT
    return this.transferService.create(user.id, dto);
  }

  // Lấy danh sách phiếu chuyển kho
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,  // Thêm
    @Query('endDate') endDate?: string,      // Thêm
  ) {
    return this.transferService.findAll(
      page,
      limit,
      status,
      search,
      startDate,
      endDate,
    );
  }


  
  @Get('stats')
  async getStats() {
    return this.transferService.getTransferStats();
  }

  @Get('total-revenue')
  async getTotalRevenueAccurate(
    @Query('startDate') startDateParam: string,
    @Query('endDate') endDateParam: string,
  ) {
    const now = new Date();

    // Lấy thời điểm bắt đầu tháng hiện tại (ngày 1, lúc 00:00:00.000)
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Lấy thời điểm kết thúc tháng hiện tại (ngày cuối tháng, lúc 23:59:59.999)
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate;
    const endDate = endDateParam ? new Date(endDateParam) : defaultEndDate;

    return this.transferService.getTotalRevenueAccurateForTransfer(startDate, endDate);
  }

  // Lấy chi tiết 1 phiếu chuyển kho





























































































  
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.findOne(id);
  }

  // Cập nhật phiếu chuyển kho
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransferDto) {
    return this.transferService.update(id, dto);
  }

  // Xóa phiếu chuyển kho
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.remove(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: TransferStatus },
  ) {
    return this.transferService.updateStatus(id, body.status);
  }

}
