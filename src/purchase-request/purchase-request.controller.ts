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
  Patch,
} from '@nestjs/common';
import { PurchaseRequestService } from './purchase-request.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { Request } from 'express';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { PurchaseRequestStatus } from '@prisma/client';

@Controller('purchase-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class PurchaseRequestController {
  constructor(private readonly purchaseRequestService: PurchaseRequestService) {}

  // Tạo mới phiếu mua hàng
  @Post()
  create(@Req() req: Request, @Body() dto: CreatePurchaseRequestDto) {
    const user = req.user as any; // lấy userId từ JWT
    return this.purchaseRequestService.create(user.id, dto);
  }

  // Lấy danh sách phiếu mua hàng
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.purchaseRequestService.findAll(+page, +limit, status, search);
  }

  // Lấy thống kê phiếu mua hàng theo trạng thái
  @Get('stats')
  getStats() {
    return this.purchaseRequestService.getStats();
  }

  // Lấy chi tiết 1 phiếu mua hàng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseRequestService.findOne(id);
  }

  // Cập nhật phiếu mua hàng
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseRequestService.update(id, dto);
  }

  // Cập nhật trạng thái phiếu mua hàng
  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: PurchaseRequestStatus,
  ) {
    return this.purchaseRequestService.updateStatus(id, status);
  }

  // Xoá phiếu mua hàng
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseRequestService.remove(id);
  }
}