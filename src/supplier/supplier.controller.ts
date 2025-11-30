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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  // Tạo mới supplier (chỉ admin được phép)
  @Post()

  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  // Lấy danh sách suppliers với phân trang
  @Get()

  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
  ) {
    return this.supplierService.findAll(+page, +limit, search);
  }

  // Lấy thông tin 1 supplier theo id
  // @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // async findOne(@Param('id') id: string) {
  //   return this.supplierService.findOne(+id);  // Dùng `+id` để chuyển string sang number
  // }


  // Cập nhật thông tin supplier
  @Put(':id')

  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(+id, updateSupplierDto);
  }

  // Xóa supplier
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(+id);
  }


   @Get('all')
  findAllWithoutPagination(@Query('search') search: string = '') {
    return this.supplierService.findAllWithoutPagination(search);
  }

}
