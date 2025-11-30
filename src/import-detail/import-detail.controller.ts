import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ImportDetailService } from './import-detail.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';
import { Request } from 'express';
import { CreateImportDetailDto } from './dto/create-import-detail.dto';
import { UpdateImportDetailDto } from './dto/update-import-detail.dto';

@Controller('import-details')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class ImportDetailController {
  constructor(private readonly importDetailService: ImportDetailService) {}

  // Tạo mới chi tiết phiếu nhập
  @Post()
  create(@Body() dto: CreateImportDetailDto) {
    return this.importDetailService.create(dto);
  }

  // Lấy chi tiết 1 import detail theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importDetailService.findOne(+id);
  }

  // Cập nhật chi tiết phiếu nhập
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateImportDetailDto) {
    return this.importDetailService.update(+id, dto);
  }

  // Xoá chi tiết phiếu nhập
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importDetailService.remove(+id);
  }



  @Get('by-import/:importId')
    async findByImportId(@Param('importId', ParseIntPipe) importId: number) {
        const details = await this.importDetailService.findByImportId(importId);
        return {
        success: true,
        message: details.length ? 'Danh sách chi tiết phiếu nhập' : 'Không có chi tiết phiếu nhập',
        data: details,
        };
    }
  }

  
