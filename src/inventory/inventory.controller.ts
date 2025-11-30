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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Tạo inventory (nếu có file upload, thêm @UseInterceptors(FileInterceptor('file')))
  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  // Lấy danh sách inventory, hỗ trợ phân trang (page, limit)
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.findAll(+page, +limit);
  }

  // Lấy 1 bản ghi inventory theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  // Cập nhật inventory (nếu có file upload, thêm @UseInterceptors(FileInterceptor('file')))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }
  

  // Xóa inventory
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }


  @Get('product/:productId')
  async findByProductId(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(+productId);
  }

  @Get('product/:productId/total')
  async getTotalQuantity(@Param('productId') productId: string) {
    const totalQuantity = await this.inventoryService.getTotalQuantityForProduct(+productId);
    return {
      success: true,
      message: 'Tổng số lượng sản phẩm',
      data: totalQuantity,
    };
  }
}
