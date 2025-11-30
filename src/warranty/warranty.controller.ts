import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('warranty')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  // Tạo bảo hành mới
  @Post()
  create(@Body() createWarrantyDto: CreateWarrantyDto) {
    return this.warrantyService.create(createWarrantyDto);
  }

  // Lấy danh sách bảo hành có phân trang + tìm kiếm
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.warrantyService.findAll(page, limit, search);
  }

  // Lấy chi tiết bảo hành theo ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.warrantyService.findOne(id);
  }

  // Cập nhật thông tin bảo hành
  @Put(':id')
  update(@Param('id') id: number, @Body() updateWarrantyDto: UpdateWarrantyDto) {
    return this.warrantyService.update(id, updateWarrantyDto);
  }

  // Xoá bảo hành
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.warrantyService.remove(id);
  }


}
