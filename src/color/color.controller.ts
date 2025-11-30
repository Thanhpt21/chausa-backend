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
import { ColorService } from './color.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('colors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN) // Chỉ cho phép ADMIN và SUPERADMIN truy cập
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  // Tạo mới màu sắc (chỉ admin được phép)
  @Post()
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorService.create(createColorDto);
  }

  // Lấy danh sách màu sắc với phân trang
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
  ) {
    return this.colorService.findAll(+page, +limit, search);
  }

  // Lấy danh sách màu sắc không phân trang
  @Get('all')
  findAllWithoutPagination(@Query('search') search = '') {
    return this.colorService.findAllWithoutPagination(search);
  }

  // Lấy thông tin 1 màu sắc theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colorService.findOne(+id);
  }

  // Cập nhật thông tin màu sắc
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    return this.colorService.update(+id, updateColorDto);
  }

  // Xóa màu sắc
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colorService.remove(+id);
  }
}
