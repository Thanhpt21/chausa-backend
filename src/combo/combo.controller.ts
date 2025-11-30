// src/combo/combo.controller.ts
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
import { ComboService } from './combo.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('combo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN) // chỉ admin và superadmin mới truy cập
export class ComboController {
  constructor(private readonly comboService: ComboService) {}

  // Tạo mới combo
  @Post()
  create(@Body() createComboDto: CreateComboDto) {
    return this.comboService.create(createComboDto);
  }

  // Lấy danh sách combo với phân trang
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
  ) {
    return this.comboService.findAll(+page, +limit, search);
  }

  // Lấy danh sách combo không phân trang
  @Get('all')
  findAllWithoutPagination(@Query('search') search = '') {
    return this.comboService.findAllWithoutPagination(search);
  }

  // Lấy thông tin combo theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comboService.findOne(+id);
  }

  // Cập nhật combo
  @Put(':id')
  update(@Param('id') id: string, @Body() updateComboDto: UpdateComboDto) {
    return this.comboService.update(+id, updateComboDto);
  }

  // Xóa combo
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comboService.remove(+id);
  }
  
}
