import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';
import { extractPublicId } from 'src/utils/file.util';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProductSizeDetail } from 'src/types/product.type';


@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name); 
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // Tạo sản phẩm mới với thumb và images
  async create(
    dto: CreateProductDto,
    files: { thumb?: Express.Multer.File[]; images?: Express.Multer.File[] },
  ) {
    if (!dto.title || typeof dto.title !== 'string') {
      throw new BadRequestException('Tiêu đề sản phẩm là bắt buộc và phải là chuỗi.');
    }

    const slug = slugify(dto.title, { lower: true });

    let thumb = dto.thumb;

    // Upload thumb nếu có
    if (files?.thumb?.[0]) {
      const { secure_url } = await this.uploadService.uploadImage(
        files.thumb[0],
        0, // ID sản phẩm sẽ được gán sau, tạm thời truyền 0
        'product',
      );
      thumb = secure_url;
    }
    thumb = thumb ?? '';


    // Chuyển đổi các trường số sang Number và gán undefined nếu không có
    const price = Number(dto.price);
    const discount = dto.discount ? Number(dto.discount) : 0;
    const discountSingle = dto.discountSingle ? Number(dto.discountSingle) : 0;
    const discountMultiple = dto.discountMultiple ? Number(dto.discountMultiple) : 0;
    const categoryId = dto.categoryId ? Number(dto.categoryId) : undefined;
    const weight = dto.weight ? Number(dto.weight) : undefined;
    const weightUnit = dto.weightUnit ?? 'gram';
    const unit = dto.unit ?? 'cái';

    // Tạo product trong database
    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        sku: dto.sku,
        thumb,
        price,
        discount,
        discountSingle,
        discountMultiple,
        categoryId,
        weight,
        weightUnit,
        unit,
      },
    });

   // Kiểm tra nếu colors là chuỗi JSON, chuyển nó thành mảng
    if (typeof dto.colors === 'string') {
      dto.colors = JSON.parse(dto.colors);
    }

    // Tiếp tục xử lý mảng dto.colors
    if (dto.colors) {
      const productColors = dto.colors.map(color => ({
        productId: product.id,
        colorId: color.colorId,
        quantity: color.quantity || 0, // Mặc định số lượng = 0 nếu không có
        title: color.title || 'Không xác định',
      }));

      // Lưu vào ProductColor
      await this.prisma.productColor.createMany({
        data: productColors,
      });
    }

    // Trả về kết quả product vừa tạo (không include các quan hệ không cần thiết)
    return {
      success: true,
      message: 'Sản phẩm đã được tạo thành công.',
      data: product,
    };
  }


  async update(
    id: number,
    dto: UpdateProductDto,
    files: { thumb?: Express.Multer.File[]; images?: Express.Multer.File[] },
  ) {
      // Chuyển đổi `dto.colors` sang kiểu `ProductColorDto[]` nếu cần thiết
  if (dto.colors && typeof dto.colors === 'string') {
    dto.colors = JSON.parse(dto.colors); // Đảm bảo biến dto.colors là mảng đối tượng nếu cần
  }
    // 1. Tìm sản phẩm
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}.`);
    }

    // 2. Chuẩn bị dữ liệu cập nhật
    const updateData: Prisma.ProductUpdateInput = {};

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.discount !== undefined) updateData.discount = dto.discount;
    if (dto.discountSingle !== undefined) {
      updateData.discountSingle = dto.discountSingle;
    }
    if (dto.discountMultiple !== undefined) {
      updateData.discountMultiple = dto.discountMultiple;
    }
    if (dto.categoryId !== undefined) {
      updateData.category = dto.categoryId === null ? { disconnect: true } : { connect: { id: dto.categoryId } };
    }
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.weightUnit !== undefined) updateData.weightUnit = dto.weightUnit;
    if (dto.unit !== undefined) updateData.unit = dto.unit;

    if ('slug' in dto) delete dto.slug;

    // 3. Xử lý tải lên Thumb
    if (files?.thumb?.[0]) {
      if (product.thumb) {
        const oldThumbPublicId = extractPublicId(product.thumb);
        if (oldThumbPublicId) await this.uploadService.deleteImage(oldThumbPublicId);
      }
      const { secure_url } = await this.uploadService.uploadImage(files.thumb[0], id, 'product');
      updateData.thumb = secure_url;
    }

    // Cập nhật mối quan hệ màu sắc
  if (dto.colors && dto.colors.length > 0) {
    const colorUpdates = dto.colors.map(color => ({
      productId: product.id,
      colorId: color.colorId,
      quantity: color.quantity || 0,
      title: color.title || 'Không xác định',
    }));

    // Xóa bản ghi cũ trong bảng ProductColor trước khi cập nhật
    await this.prisma.productColor.deleteMany({
      where: { productId: product.id },
    });

    // Tạo lại mối quan hệ màu sắc
    await this.prisma.productColor.createMany({
      data: colorUpdates,
    });
  }

    // 5. Cập nhật sản phẩm
    await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    // 6. Lấy lại sản phẩm cập nhật và trả về
    const updatedProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, colors: true }, // Bao gồm danh mục và màu sắc
    });

    if (!updatedProduct) {
      throw new InternalServerErrorException('Không tìm thấy sản phẩm sau khi cập nhật.');
    }

    return {
      success: true,
      message: 'Cập nhật sản phẩm thành công.',
      data: updatedProduct,
    };
  }

  async findLowStockProducts(threshold: number) {
    if (threshold === undefined || isNaN(threshold)) {
      throw new Error('Thiếu hoặc sai kiểu tham số threshold');
    }

    // Lấy danh sách sản phẩm
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        quantity: true,
        sku: true,
        colors: true,
        price: true,
        discount: true,
      },
    });

    // Xử lý song song lấy tồn kho chi tiết, tính toán và lọc sản phẩm tồn kho thấp theo màu
    const lowStockProducts = (await Promise.all(
      products.map(async (product) => {
        const stockInfo = await this.findColorQuantityByProductId(product.id);

        // Lọc màu có tồn kho thấp hơn threshold
        const lowStockColors = stockInfo.data.filter(
          (item) => item.remainingQuantity < threshold
        );

        if (lowStockColors.length > 0) {
          const totalExportedAndTransferred = lowStockColors.reduce(
            (sum, item) => sum + item.exportedAndTransferredQuantity,
            0
          );

          const totalRemaining = lowStockColors.reduce(
            (sum, item) => sum + item.remainingQuantity,
            0
          );

          return {
            ...product,
            stockByColor: lowStockColors,
            totalImported: stockInfo.totalQuantity,
            totalExportedAndTransferred,
            totalRemaining,
          };
        }
        return null; // Không có màu nào tồn kho thấp => bỏ sản phẩm
      })
    )).filter((product) => product !== null);

    return {
      success: true,
      message:
        lowStockProducts.length > 0
          ? `Danh sách sản phẩm tồn kho thấp hơn ${threshold}`
          : `Không có sản phẩm nào tồn kho thấp hơn ${threshold}`,
      data: lowStockProducts,
    };
  }


  async findAll(
    page = 1,
    limit = 10,
    search = '',
    categoryId?: number,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    if (categoryId) {
      whereClause.categoryId = Number(categoryId);
    }

    const orderByClause: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    // Lấy danh sách sản phẩm và tổng số sản phẩm trong 1 transaction
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          category: {
            select: {
              id: true,
              title: true,
              slug: true,
              parentId: true,
            },
          },
          colors: {
            select: {
              colorId: true,
              quantity: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where: whereClause }),
    ]);

    // Lấy tồn kho chi tiết theo màu và tồn kho tổng cho từng sản phẩm
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stockByColorInfo = await this.findColorQuantityByProductId(product.id);
        const stockTotalInfo = await this.calculateStock(product.id);

        return {
          ...product,
          stockByColor: stockByColorInfo.data, // tồn kho chi tiết theo màu
          stock: {
            totalImported: stockTotalInfo.data.totalImported,
            totalExported: stockTotalInfo.data.totalExportedAndTransferred,
            remainingQuantity: stockTotalInfo.data.remainingQuantity,
          },
        };
      })
    );

    return {
      success: true,
      message: total > 0 ? 'Products found successfully' : 'No products found',
      data: productsWithStock,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }


  async findAllWithoutPagination(search = '', categoryId?: number) {
    const whereClause: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    if (categoryId) {
      whereClause.categoryId = Number(categoryId);
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        quantity: true,
        sku: true,
        colors: true,
        price: true,
        discount: true,
        discountSingle: true,
        discountMultiple: true,
        unit: true
      },
    });

    // Gọi tồn kho chi tiết cho từng sản phẩm
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stockInfo = await this.findColorQuantityByProductId(product.id);

        const totalExportedAndTransferred = stockInfo.data.reduce(
          (sum, item) => sum + item.exportedAndTransferredQuantity,
          0
        );

        const totalRemaining = stockInfo.data.reduce(
          (sum, item) => sum + item.remainingQuantity,
          0
        );

        return {
          ...product,
          stockByColor: stockInfo.data,
          totalImported: stockInfo.totalQuantity,
          totalExportedAndTransferred,
          totalRemaining,
        };
      })
    );

    return {
      success: true,
      message: productsWithStock.length > 0 ? 'Lấy sản phẩm thành công' : 'Không tìm thấy sản phẩm',
      data: productsWithStock,
    };
  }


  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            slug: true,
            parentId: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      success: true,
      message: `Product with ID fetched successfully`,
      data: product,
    };
  }



  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Xóa ảnh thumb nếu có
    if (product.thumb) {
      const thumbId = extractPublicId(product.thumb);
      if (thumbId) {
        await this.uploadService.deleteImage(thumbId);
      }
    }
  
    await this.prisma.productColor.deleteMany({ where: { productId: id } });
    // Xóa sản phẩm
    await this.prisma.product.delete({ where: { id } });

    return {
      success: true,
      message: 'Product removed successfully',
    };
  }

  async findColorQuantityByProductId(productId: number): Promise<{
    success: boolean;
    message: string;
    data: {
      colorTitle: string;
      importedQuantity: number;
      exportedAndTransferredQuantity: number; // Gộp xuất kho và chuyển kho
      remainingQuantity: number;
    }[],
    totalQuantity: number;
  }> {
    // 1. Lấy chi tiết nhập kho với trạng thái 'COMPLETED'
    const importDetails = await this.prisma.importDetail.findMany({
      where: {
        productId,
        import: {
          status: 'COMPLETED',
        },
      },
      select: {
        colorTitle: true,
        quantity: true,
        color: true
      },
    });

    // 2. Lấy chi tiết xuất kho với trạng thái 'EXPORTED'
    const exportDetails = await this.prisma.exportDetail.findMany({
      where: {
        productId,
        export: {
          status: { in: ['EXPORTED', 'COMPLETED','PREPARED'] }, // Chỉ lấy các bản ghi có trạng thái 'EXPORTED'
        },
      },
      select: {
        colorTitle: true,
        quantity: true,
        color: true
      },
    });

    // 3. Lấy chi tiết chuyển kho với trạng thái 'COMPLETED'
    const transferDetails = await this.prisma.transferDetail.findMany({
      where: {
        productId,
        transfer: {
          status: { in: ['EXPORTED', 'COMPLETED'] }, // Chỉ lấy các bản ghi có trạng thái 'COMPLETED'
        },
      },
      select: {
        colorTitle: true,
        quantity: true,
        color: true
      },
    });

    // 4. Tính tổng số lượng nhập theo từng màu
    const importResult = importDetails.reduce<{ colorTitle: string; quantity: number; color: number }[]>((acc, { colorTitle, quantity, color }) => {
      const existing = acc.find(item => item.colorTitle === colorTitle);
      if (existing) {
        existing.quantity += quantity; // Cộng dồn số lượng nhập cùng màu
      } else {
        acc.push({ colorTitle, quantity, color });
      }
      return acc;
    }, []);

    // 5. Tính tổng số lượng xuất theo từng màu
    const exportResult = exportDetails.reduce<{ colorTitle: string; quantity: number; color: number }[]>((acc, { colorTitle, quantity, color }) => {
      const existing = acc.find(item => item.colorTitle === colorTitle);
      if (existing) {
        existing.quantity += quantity; // Cộng dồn số lượng xuất cùng màu
      } else {
        acc.push({ colorTitle, quantity, color });
      }
      return acc;
    }, []);

    // 6. Tính tổng số lượng chuyển kho theo từng màu
    const transferResult = transferDetails.reduce<{ colorTitle: string; quantity: number; color: number }[]>((acc, { colorTitle, quantity, color }) => {
      const existing = acc.find(item => item.colorTitle === colorTitle);
      if (existing) {
        existing.quantity += quantity; // Cộng dồn số lượng chuyển kho cùng màu
      } else {
        acc.push({ colorTitle, quantity, color });
      }
      return acc;
    }, []);

    // 7. Kết hợp kết quả nhập, xuất và chuyển kho
    const combinedResult = importResult.map(importItem => {
      const exportItem = exportResult.find(exportItem => exportItem.colorTitle === importItem.colorTitle) || { colorTitle: importItem.colorTitle, quantity: 0 };
      const transferItem = transferResult.find(transferItem => transferItem.colorTitle === importItem.colorTitle) || { colorTitle: importItem.colorTitle, quantity: 0 };

      // Gộp xuất kho và chuyển kho
      const exportedAndTransferredQuantity = exportItem.quantity + transferItem.quantity;

      return {
        color: importItem.color,
        colorTitle: importItem.colorTitle,
        importedQuantity: importItem.quantity,
        exportedAndTransferredQuantity, // Số lượng xuất kho và chuyển kho gộp lại
        remainingQuantity: importItem.quantity - exportedAndTransferredQuantity, // Tính số lượng còn lại
      };
    });

    // 8. Tính tổng số lượng nhập
    const totalQuantity = combinedResult.reduce((sum, { importedQuantity }) => sum + importedQuantity, 0);

    return {
      success: true,
      message: combinedResult.length > 0 ? 'Lấy danh sách màu và số lượng thành công' : 'Không có chi tiết màu nào cho sản phẩm này',
      data: combinedResult,
      totalQuantity, // Tổng số lượng nhập
    };
  }

  async calculateStock(id: number) {
    // 1. Tính tổng số lượng nhập (chỉ tính import.status = 'COMPLETED')
    const totalImports = await this.prisma.importDetail.aggregate({
      where: {
        productId: id,
        import: {
          status: { equals: 'COMPLETED' },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // 2. Tính tổng số lượng đã xuất từ Export (exportDetail với export.status = 'COMPLETED')
    const totalExports = await this.prisma.exportDetail.aggregate({
      where: {
        productId: id,
        export: {
          status: { in: ['EXPORTED', 'COMPLETED', 'PREPARED'] },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // 3. Tính tổng số lượng đã xuất từ Transfer (transferDetail với transfer.status = 'COMPLETED')
    const totalTransfers = await this.prisma.transferDetail.aggregate({
      where: {
        productId: id,
        transfer: {
          status: { in: ['EXPORTED', 'COMPLETED', 'PREPARED'] },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const hasNoImport = totalImports._sum?.quantity === null;
    const hasNoExport = totalExports._sum?.quantity === null;
    const hasNoTransfer = totalTransfers._sum?.quantity === null;

    // Nếu không có cả nhập, xuất hay chuyển kho
    if (hasNoImport && hasNoExport && hasNoTransfer) {
      return {
        success: false,
        message: 'Không có dữ liệu nhập, xuất hoặc chuyển kho cho sản phẩm này.',
        data: {
          totalImported: 0,
          totalExported: 0,
          totalTransferred: 0,
          remainingQuantity: 0,
        },
      };
    }

    const totalImported = totalImports._sum?.quantity ?? 0;
    const totalExported = totalExports._sum?.quantity ?? 0;
    const totalTransferred = totalTransfers._sum?.quantity ?? 0;

    // Gộp totalExported và totalTransferred thành một giá trị duy nhất
    const totalExportedAndTransferred = totalExported + totalTransferred;

    const remainingQuantity = totalImported - totalExportedAndTransferred;

    return {
      success: true,
      message: 'Tính toán số lượng thành công.',
      data: {
        totalImported,
        totalExportedAndTransferred,  // Trả về giá trị gộp
        remainingQuantity,
      },
    };
  }


  async getAllProductColors(productId: number) {
    const productColors = await this.prisma.productColor.findMany({
      where: { productId },
      include: {
        color: {
          select: {
            title: true, // Lấy tên màu sắc từ bảng Color
          },
        },
      },
    });

    return productColors;
  }

  async findProductsOverExported() {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        title: true,
        sku: true,
        price: true,
        discount: true,
        colors: true,
      },
    });

    const overExportedProducts = (await Promise.all(
      products.map(async (product) => {
        const stockInfo = await this.findColorQuantityByProductId(product.id);

        const negativeStockColors = stockInfo.data.filter(
          (item) => item.remainingQuantity < 0
        );

        if (negativeStockColors.length > 0) {
          return {
            ...product,
            negativeStockColors,
            totalRemaining: stockInfo.data.reduce((sum, c) => sum + c.remainingQuantity, 0),
          };
        }

        return null;
      })
    )).filter((product) => product !== null);

    return {
      success: true,
      message: overExportedProducts.length > 0
        ? 'Danh sách sản phẩm bị xuất vượt tồn kho'
        : 'Không có sản phẩm nào bị âm tồn kho',
      data: overExportedProducts,
    };
}



}
