import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TransferOrderDetailService } from './transfer-order-detail.service';
import { CreateTransferOrderDetailDto } from './dto/create-transfer-order-detail.dto';
import { UpdateTransferOrderDetailDto } from './dto/update-transfer-order-detail.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('transfer-order-details')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class TransferOrderDetailController {
  constructor(private readonly service: TransferOrderDetailService) {}

  @Post()
  create(@Body() dto: CreateTransferOrderDetailDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransferOrderDetailDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('by-transfer/:transferId')
  findByTransferId(@Param('transferId', ParseIntPipe) transferId: number) {
    return this.service.findByTransferId(transferId);
  }
}
