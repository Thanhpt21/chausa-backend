import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';
import { UploadService } from 'src/upload/upload.service';
import { extractPublicId } from 'src/utils/file.util';


@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService, private uploadService: UploadService) {}

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
      // 1. Tạo slug từ title hoặc sử dụng slug được cung cấp trong DTO
      // DTO của bạn cần có trường slug tùy chọn hoặc bạn phải đảm bảo nó được tạo tự động
      const slug = slugify(dto.title, { lower: true, strict: true });
      let imageUrl = dto.image; // Sử dụng biến imageUrl để tránh nhầm lẫn với file upload

      // 2. Kiểm tra sự tồn tại của danh mục cha nếu parentId được cung cấp
      if (dto.parentId) {
        const parentCategory = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
        if (!parentCategory) {
          throw new NotFoundException(`Danh mục cha với ID ${dto.parentId} không tìm thấy.`);
        }
      }

      // 3. Kiểm tra xem slug có bị trùng lặp không
      const existingCategory = await this.prisma.category.findUnique({ where: { slug } });
      if (existingCategory) {
        throw new BadRequestException(`Danh mục với slug '${slug}' đã tồn tại.`);
      }

      // 4. Xử lý upload ảnh nếu có file được cung cấp
      if (file) {
        // Đối với create, public_id thường không dựa vào ID của category vì category chưa được tạo.
        // Bạn có thể truyền 0 hoặc một giá trị tạm thời, hoặc xử lý public_id riêng.
        const { secure_url } = await this.uploadService.uploadImage(file, 0, 'category');
        imageUrl = secure_url; // Lưu URL của ảnh đã được upload
      }

      // 5. Tạo danh mục mới trong cơ sở dữ liệu với các dữ liệu đã chuẩn bị
      const newCategory = await this.prisma.category.create({
        data: {
          title: dto.title,
          slug,
          image: imageUrl,
          parentId: dto.parentId, // Gán parentId từ DTO
        },
      });

      return {
        success: true,
        message: 'Danh mục đã được tạo thành công',
        data: newCategory,
      };
    }

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.CategoryWhereInput = search
        ? {
            OR: [
            { title: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    const [categories, total] = await this.prisma.$transaction([
        this.prisma.category.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // ⭐ THÊM INCLUDE ĐỂ LẤY DANH MỤC CON ⭐
        include: {
            subCategories: true, // Đúng với tên trường trong schema.prisma: subCategories
        },
        }),
        this.prisma.category.count({ where: whereClause }),
    ]);

    return {
        success: true,
        message: total > 0 ? 'Categories found successfully' : 'No categories found',
        data: categories,
        total,
        page,
        pageCount: Math.ceil(total / limit),
    };
  }

  async findAllWithoutPagination(search = '') {
    const whereClause: Prisma.CategoryWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const categories = await this.prisma.category.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      // ⭐ THÊM INCLUDE ĐỂ LẤY DANH MỤC CON ⭐
      include: {
        subCategories: true, // Đúng với tên trường trong schema.prisma: subCategories
      },
    });

    return {
      success: true,
      message:
        categories.length > 0
          ? 'Categories found successfully'
          : 'No categories found',
      data: categories,
      total: categories.length,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      // ⭐ THÊM INCLUDE ĐỂ LẤY DANH MỤC CON ⭐
      include: {
        subCategories: true, // Đúng với tên trường trong schema.prisma: subCategories
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return {
        success: true,
        message: 'Category found successfully',
        data: category,
    };
  }

  async update(id: number, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục.');
    }

    const { parentId, ...restDto } = dto;
    const updateData: Prisma.CategoryUpdateInput = { ...restDto };

    // --- Bắt đầu logic cập nhật parentId thông qua quan hệ 'parent' ---
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('Một danh mục không thể là cha của chính nó.');
      }

      if (parentId !== null) {
        const parentCategory = await this.prisma.category.findUnique({ where: { id: parentId } });
        if (!parentCategory) {
          throw new NotFoundException(`Danh mục cha với ID ${parentId} không tìm thấy.`);
        }

        // Kiểm tra vòng lặp: Ngăn chặn nếu parentId là con của danh mục hiện tại (trực tiếp hoặc gián tiếp)
        // Để kiểm tra vòng lặp đầy đủ, bạn cần một hàm đệ quy.
        // Đây là kiểm tra cơ bản: không thể đặt một danh mục con của danh mục hiện tại làm cha
        const isDescendant = await this.isDescendant(id, parentId);
        if (isDescendant) {
          throw new BadRequestException('Không thể đặt danh mục này làm cha vì nó là danh mục con của danh mục hiện tại.');
        }

        updateData.parent = { connect: { id: parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }
    // --- Kết thúc logic cập nhật parentId ---

    // --- Bắt đầu logic xử lý ảnh ---
    if (file) {
      const currentPublicId = category.image ? extractPublicId(category.image) : null; 
      if (currentPublicId) {
        await this.uploadService.deleteImage(currentPublicId);
      }
      // Giả định uploadImage nhận buffer và trả về { secure_url: string }
      const { secure_url } = await this.uploadService.uploadImage(file, id, 'category');
      updateData.image = secure_url;
    }
    // --- Kết thúc logic xử lý ảnh ---

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Danh mục đã được cập nhật thành công',
      data: updatedCategory,
    };
  }

  // Hàm trợ giúp để kiểm tra xem childId có phải là con (trực tiếp hoặc gián tiếp) của ancestorId không
  // Bạn có thể đặt hàm này trong service hoặc một utility file
  private async isDescendant(ancestorId: number, childId: number): Promise<boolean> {
    if (ancestorId === childId) return true; // Một danh mục không thể là con của chính nó

    let current = await this.prisma.category.findUnique({ where: { id: childId } });
    while (current && current.parentId !== null) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = await this.prisma.category.findUnique({ where: { id: current.parentId } });
    }
    return false;
  }



  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // ⭐ THÊM LOGIC KIỂM TRA DANH MỤC CON Ở ĐÂY ⭐
    const hasChildren = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      // Nếu có danh mục con, ném ra lỗi và không cho phép xóa
      throw new BadRequestException('Cannot delete category with existing subcategories. Please delete subcategories first.');
    }
    // ⭐ KẾT THÚC LOGIC KIỂM TRA ⭐

    // Nếu category có ảnh, xóa ảnh khỏi Cloudinary (hoặc dịch vụ lưu trữ)
    const publicId = extractPublicId(category.image);
    if (publicId) {
      await this.uploadService.deleteImage(publicId);
    }

    await this.prisma.category.delete({ where: { id } });

    return {
      success: true,
      message: 'Category removed successfully',
    };
  }

}
