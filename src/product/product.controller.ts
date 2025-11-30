import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumb', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
  )
  create(
    @Body() dto: CreateProductDto,
    @UploadedFiles()
    files: {
      thumb?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.productService.create(dto, files);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumb', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles()
    files: {
      thumb?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.productService.update(+id, dto, files);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('categoryId') categoryId?: string,
  ) {
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;

    return this.productService.findAll(
      +page,
      +limit,
      search,
      parsedCategoryId,
    );
  }

  @Get('low-stock')
  async findLowStockProducts(
    @Query('threshold', ParseIntPipe) threshold: number,
  ) {
    return this.productService.findLowStockProducts(threshold);
  }

  
  @Get('stock/:productId')
  async findColorQuantityByProductId(@Param('productId') productId: number) {
    return this.productService.findColorQuantityByProductId(productId);
  }

  @Get('over-exported')
  async findProductsOverExported() {
    return this.productService.findProductsOverExported();
  }


   @Get(':id/stock')
  async getProductStock(@Param('id') id: number) {
    const productStock = await this.productService.calculateStock(id);

    // Kiểm tra xem sản phẩm có tồn tại không
    if (!productStock) {
      throw new NotFoundException('Product not found');
    }

    return productStock;
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Get('all')
  findAllWithoutPagination(
    @Query('search') search = '',
    @Query('categoryId') categoryId?: string,
  ) {
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;

    return this.productService.findAllWithoutPagination(search, parsedCategoryId);
  }

  @Get(':id/colors')
  async getProductColors(@Param('id') id: number) {
    // Gọi service để lấy danh sách màu sắc
    const colors = await this.productService.getAllProductColors(id);

    // Kiểm tra xem có màu sắc không
    if (colors.length === 0) {
      throw new NotFoundException('No colors found for this product');
    }

    return colors;
  }



}
