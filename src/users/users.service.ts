// src/users/users.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UploadService } from 'src/upload/upload.service';
import { extractPublicId } from 'src/utils/file.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,  private uploadService: UploadService) {}

  // Tạo user mới
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phoneNumber?: string;
    gender?: string;
    profilePicture?: string | null;
    type_account?: string;
    isActive?: boolean;
  }) {
    const newUser = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // sử dụng mật khẩu đã mã hóa
        role: data.role ?? 'customer',
        phoneNumber: data.phoneNumber ?? null,
        gender: data.gender ?? null,
        profilePicture: data.profilePicture ?? null,
        type_account: data.type_account ?? 'normal',
        isActive: data.isActive ?? true,
      },
    });

    return {
      success: true,
      message: 'User created successfully',
      data: newUser,
    };
  }


  // Lấy tất cả users
  async getUsers(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Users found successfully' : 'No users found',
      data: users.map(user => new UserResponseDto(user)),
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }



  // user theo id
  // k dc sửa gì 
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }


  // ✅ Cập nhật user
async updateUser(
  id: number,
  data: UpdateUserDto,
  file?: Express.Multer.File,
) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException('User not found');

  const updateData: any = { ...data };

  // 👉 Normalize dữ liệu string → đúng kiểu Prisma yêu cầu
  const normalize = (val: any) => {
    if (val === 'null') return null;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  };

  updateData.phoneNumber = normalize(updateData.phoneNumber);
  updateData.gender = normalize(updateData.gender);
  updateData.role = normalize(updateData.role);
  updateData.type_account = normalize(updateData.type_account);
  updateData.isActive = normalize(updateData.isActive);

  // 👉 Nếu có password thì mã hoá
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // 👉 Nếu có file upload ảnh mới
  if (file) {
    const currentPublicId = extractPublicId(user.profilePicture);
    if (currentPublicId) {
      await this.uploadService.deleteImage(currentPublicId);
    }

    const { secure_url, public_id } = await this.uploadService.uploadImage(file, id, 'user');
    updateData.profilePicture = secure_url;
    updateData.profilePicturePublicId = public_id;
  }

  const updatedUser = await this.prisma.user.update({
    where: { id },
    data: updateData,
  });

  return {
    success: true,
    message: 'User updated successfully',
    data: new UserResponseDto(updatedUser),
  };
}




  


  // ✅ Xoá user
  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');


    await this.prisma.user.delete({ where: { id } });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }


  // k dc sửa gì 
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }


}
