import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // Tạo mới kho hàng
  @Post()
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.create(createWarehouseDto);
  }

  // Lấy danh sách kho hàng với phân trang và tìm kiếm
  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('search') search: string = '') {
    return this.warehouseService.findAll(page, limit, search);
  }

  // Lấy tất cả kho hàng mà không phân trang
  @Get('all')
  findAllWithoutPagination(@Query('search') search: string = '') {
    return this.warehouseService.findAllWithoutPagination(search);
  }

  // Lấy thông tin kho hàng theo ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.warehouseService.findOne(id);
  }

  // Cập nhật thông tin kho hàng
  @Put(':id')
  update(@Param('id') id: number, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, updateWarehouseDto);
  }

  // Xóa kho hàng
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.warehouseService.remove(id);
  }
}
