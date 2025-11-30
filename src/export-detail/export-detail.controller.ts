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
  Query,
} from '@nestjs/common';
import { ExportDetailService } from './export-detail.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { CreateExportDetailDto } from './dto/create-export-detail.dto';
import { UpdateExportDetailDto } from './dto/update-export-detail.dto';

@Controller('export-details')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class ExportDetailController {
  constructor(private readonly exportDetailService: ExportDetailService) {}

  // Tạo mới chi tiết phiếu xuất
  @Post()
  create(@Body() dto: CreateExportDetailDto) {
    return this.exportDetailService.create(dto);
  }

  // Lấy chi tiết 1 export detail theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportDetailService.findOne(+id);
  }

    @Put('update-category-order')
  async updateProjectCategoryOrder(@Body() body: {
    exportId: number;
    projectCategoryId: number | null;
    projectCategoryOrder: number;
  }) {
    const { exportId, projectCategoryId, projectCategoryOrder } = body;
    return this.exportDetailService.updateProjectCategoryOrderByCategory(exportId, projectCategoryId, projectCategoryOrder);
  }

  // Cập nhật chi tiết phiếu xuất
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExportDetailDto) {
    return this.exportDetailService.update(+id, dto);
  }



  // Xoá chi tiết phiếu xuất
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exportDetailService.remove(+id);
  }

  // Lấy danh sách chi tiết theo exportId
  @Get('by-export/:exportId')
  async findByExportId(@Param('exportId', ParseIntPipe) exportId: number) {
    const details = await this.exportDetailService.findByExportId(exportId);
    return {
      success: true,
      message: details.length ? 'Danh sách chi tiết phiếu xuất' : 'Không có chi tiết phiếu xuất',
      data: details,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
  ) {
    return this.exportDetailService.findAll(+page, +limit, search);
  }
}
