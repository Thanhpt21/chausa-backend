import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Put, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Route tạo category, hỗ trợ file ảnh
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Interceptor xử lý file ảnh, 'file' là tên field trong form-data
  create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File, // Nhận file ảnh từ form-data
  ) {
    return this.categoryService.create(dto, file);  // Gọi service để tạo category với ảnh
  }

  // Route lấy tất cả categories
  @Get()
  async getCategories(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return await this.categoryService.findAll(+page, +limit, search);
  }

  @Get('all')
  async getAllCategoriesWithoutPagination(@Query('search') search = '') {
    return this.categoryService.findAllWithoutPagination(search);
  }

  // Route lấy category theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  // Route cập nhật category, hỗ trợ file ảnh
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))  // Interceptor xử lý file ảnh
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File, // Nhận file ảnh từ form-data
  ) {
    return this.categoryService.update(+id, dto, file);  // Gọi service để cập nhật category với ảnh
  }

  // Route xóa category
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
