import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PurchaseRequestDetailService } from './purchase-request-detail.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { CreatePurchaseRequestDetailDto } from './dto/create-purchase-request-detail.dto';
import { UpdatePurchaseRequestDetailDto } from './dto/update-purchase-request-detail.dto';

@Controller('purchase-request-details')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class PurchaseRequestDetailController {
  constructor(private readonly service: PurchaseRequestDetailService) {}

  // Tạo mới chi tiết phiếu mua hàng
  @Post()
  create(@Body() dto: CreatePurchaseRequestDetailDto) {
    return this.service.create(dto);
  }

  // Lấy chi tiết theo ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Cập nhật chi tiết phiếu mua hàng
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseRequestDetailDto,
  ) {
    return this.service.update(id, dto);
  }

  // Xoá chi tiết phiếu mua hàng
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // Lấy danh sách chi tiết theo purchaseRequestId
  @Get('by-purchase/:purchaseRequestId')
  async findByPurchaseRequestId(
    @Param('purchaseRequestId', ParseIntPipe) purchaseRequestId: number,
  ) {
    const details = await this.service.findByPurchaseRequestId(purchaseRequestId);
    return {
      success: true,
      message: details.length
        ? 'Danh sách chi tiết phiếu mua hàng'
        : 'Không có chi tiết phiếu mua hàng',
      data: details,
    };
  }
}