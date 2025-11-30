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
import { ProductComboService } from './product-combo.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { AddProductToComboDto } from './dto/add-product-to-combo.dto';
import { UpdateProductInComboDto } from './dto/update-product-in-combo.dto';

@Controller('product-combo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class ProductComboController {
  constructor(private readonly productComboService: ProductComboService) {}

  // Thêm sản phẩm vào combo
  @Post()
  create(@Body() dto: AddProductToComboDto) {
    return this.productComboService.add(dto.comboId, dto);
  }

    @Get('by-combo/:comboId')
  findByCombo(@Param('comboId', ParseIntPipe) comboId: number) {
    return this.productComboService.findAll(comboId);
  }

  // Lấy chi tiết 1 sản phẩm trong combo theo comboId và productId
  @Get(':comboId/:productId')
  findOne(
    @Param('comboId', ParseIntPipe) comboId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productComboService.findOne(comboId, productId);
  }

  // Cập nhật sản phẩm trong combo
  @Put(':comboId/:productId')
  update(
    @Param('comboId', ParseIntPipe) comboId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductInComboDto,
  ) {
    return this.productComboService.update(comboId, productId, dto);
  }

  // Xóa sản phẩm khỏi combo
  @Delete(':comboId/:productId')
  remove(
    @Param('comboId', ParseIntPipe) comboId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productComboService.remove(comboId, productId);
  }
}