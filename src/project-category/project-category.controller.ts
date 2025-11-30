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
import { ProjectCategoryService } from './project-category.service';
import { CreateProjectCategoryDto } from './dto/create-project-category.dto';
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user.enums';

@Controller('project-category')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN) // Chỉ admin và superadmin được truy cập
export class ProjectCategoryController {
  constructor(private readonly projectCategoryService: ProjectCategoryService) {}

  // Tạo mới hạng mục thi công
  @Post()
  create(@Body() createProjectCategoryDto: CreateProjectCategoryDto) {
    return this.projectCategoryService.create(createProjectCategoryDto);
  }

  // Lấy danh sách hạng mục thi công với phân trang
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
  ) {
    return this.projectCategoryService.findAll(+page, +limit, search);
  }

  // Lấy danh sách hạng mục thi công không phân trang
  @Get('all')
  findAllWithoutPagination(@Query('search') search = '') {
    return this.projectCategoryService.findAllWithoutPagination(search);
  }

  // Lấy thông tin một hạng mục theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectCategoryService.findOne(+id);
  }

  // Cập nhật hạng mục thi công
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectCategoryDto: UpdateProjectCategoryDto,
  ) {
    return this.projectCategoryService.update(+id, updateProjectCategoryDto);
  }

  // Xóa hạng mục thi công
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectCategoryService.remove(+id);
  }
}