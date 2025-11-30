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
  Query,
} from '@nestjs/common';
import { TransferDetailService } from './transfer-detail.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { CreateTransferDetailDto } from './dto/create-transfer-detail.dto';
import { UpdateTransferDetailDto } from './dto/update-transfer-detail.dto';

@Controller('transfer-details')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class TransferDetailController {
  constructor(private readonly transferDetailService: TransferDetailService) {}

  // Tạo mới chi tiết phiếu chuyển
  @Post()
  create(@Body() dto: CreateTransferDetailDto) {
    return this.transferDetailService.create(dto);
  }

  // Lấy chi tiết 1 transfer detail theo id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transferDetailService.findOne(id);
  }

  // Cập nhật chi tiết phiếu chuyển
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransferDetailDto) {
    return this.transferDetailService.update(id, dto);
  }

  // Xoá chi tiết phiếu chuyển
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transferDetailService.remove(id);
  }

  // Lấy danh sách chi tiết theo transferId
  @Get('by-transfer/:transferId')
  async findByTransferId(@Param('transferId', ParseIntPipe) transferId: number) {
    const details = await this.transferDetailService.findByTransferId(transferId);
    return {
      success: true,
      message: details.length ? 'Danh sách chi tiết phiếu chuyển' : 'Không có chi tiết phiếu chuyển',
      data: details,
    };
  }

  // Phân trang và tìm kiếm chi tiết
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.transferDetailService.findAll(+page, +limit, search);
  }
}
