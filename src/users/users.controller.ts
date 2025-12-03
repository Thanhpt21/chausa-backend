// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './enums/user.enums';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { SelfOrAdminGuard } from 'src/common/guards/self-or-admin/self-or-admin.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return await this.usersService.getUsers(+page, +limit, search);
  }

  // Lấy user theo id
  @Get(':id')
  // @Permissions('get_a_users')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserById(id);
  }


  // ✅ Cập nhật user
  @Put(':id')
   @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
   @UseInterceptors(FileInterceptor('file'))
  async updateUser(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.usersService.updateUser(+id, updateUserDto, file);
  }

 @Delete('image')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Query('public_id') publicId: string) {
    await this.uploadService.deleteImage(publicId);
    return { message: 'Xóa ảnh thành công' };
  }



  // ✅ Xoá user
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(+id);
  }



}
