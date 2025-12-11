import {
  BadRequestException,
  ConflictException,
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
import { Response } from 'express';
import * as XLSX from 'xlsx';
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

    // 👈 KIỂM TRA SKU ĐÃ TỒN TẠI CHƯA
    if (dto.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: { sku: dto.sku },
      });
      
      if (existingProduct) {
        throw new ConflictException(`Mã sản phẩm "${dto.sku}" đã tồn tại trong hệ thống. Vui lòng sử dụng mã khác.`);
      }
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

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.product.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: total > 0 ? 'Products found successfully' : 'No products found',
      data: products, // Không cần transform thêm
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
    size: string; // 👈 THÊM SIZE
    importedQuantity: number;
    exportedAndTransferredQuantity: number;
    remainingQuantity: number;
  }[],
  totalQuantity: number;
}> {
  // 1. Lấy chi tiết nhập kho với trạng thái 'COMPLETED' - THÊM SIZE
  const importDetails = await this.prisma.importDetail.findMany({
    where: {
      productId,
      import: {
        status: 'COMPLETED',
      },
    },
    select: {
      colorTitle: true,
      size: true, // 👈 THÊM SIZE
      quantity: true,
      color: true
    },
  });

  // 2. Lấy chi tiết xuất kho với trạng thái 'EXPORTED' - THÊM SIZE
  const exportDetails = await this.prisma.exportDetail.findMany({
    where: {
      productId,
      export: {
        status: { in: ['EXPORTED', 'COMPLETED','PREPARED'] },
      },
    },
    select: {
      colorTitle: true,
      size: true, // 👈 THÊM SIZE
      quantity: true,
      color: true
    },
  });

  // 3. Lấy chi tiết chuyển kho với trạng thái 'COMPLETED' - THÊM SIZE
  const transferDetails = await this.prisma.transferDetail.findMany({
    where: {
      productId,
      transfer: {
        status: { in: ['EXPORTED', 'COMPLETED'] },
      },
    },
    select: {
      colorTitle: true,
      size: true, // 👈 THÊM SIZE
      quantity: true,
      color: true
    },
  });

  // 4. Tính tổng số lượng nhập theo từng màu VÀ SIZE
  const importResult = importDetails.reduce<{ 
    colorTitle: string; 
    size: string; // 👈 THÊM SIZE
    quantity: number; 
    color: number 
  }[]>((acc, { colorTitle, size, quantity, color }) => {
    const key = `${colorTitle}-${size}`; // 👈 TẠO KEY DUY NHẤT THEO MÀU + SIZE
    const existing = acc.find(item => `${item.colorTitle}-${item.size}` === key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      acc.push({ colorTitle, size: size || '', quantity, color }); // 👈 THÊM SIZE
    }
    return acc;
  }, []);

  // 5. Tính tổng số lượng xuất theo từng màu VÀ SIZE
  const exportResult = exportDetails.reduce<{ 
    colorTitle: string; 
    size: string; // 👈 THÊM SIZE
    quantity: number; 
    color: number 
  }[]>((acc, { colorTitle, size, quantity, color }) => {
    const key = `${colorTitle}-${size}`; // 👈 TẠO KEY DUY NHẤT THEO MÀU + SIZE
    const existing = acc.find(item => `${item.colorTitle}-${item.size}` === key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      acc.push({ colorTitle, size: size || '', quantity, color }); // 👈 THÊM SIZE
    }
    return acc;
  }, []);

  // 6. Tính tổng số lượng chuyển kho theo từng màu VÀ SIZE
  const transferResult = transferDetails.reduce<{ 
    colorTitle: string; 
    size: string; // 👈 THÊM SIZE
    quantity: number; 
    color: number 
  }[]>((acc, { colorTitle, size, quantity, color }) => {
    const key = `${colorTitle}-${size}`; // 👈 TẠO KEY DUY NHẤT THEO MÀU + SIZE
    const existing = acc.find(item => `${item.colorTitle}-${item.size}` === key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      acc.push({ colorTitle, size: size || '', quantity, color }); // 👈 THÊM SIZE
    }
    return acc;
  }, []);

  // 7. Kết hợp kết quả nhập, xuất và chuyển kho THEO MÀU + SIZE
  const combinedResult = importResult.map(importItem => {
    const key = `${importItem.colorTitle}-${importItem.size}`;
    
    const exportItem = exportResult.find(exportItem => 
      `${exportItem.colorTitle}-${exportItem.size}` === key
    ) || { colorTitle: importItem.colorTitle, size: importItem.size, quantity: 0 };
    
    const transferItem = transferResult.find(transferItem => 
      `${transferItem.colorTitle}-${transferItem.size}` === key
    ) || { colorTitle: importItem.colorTitle, size: importItem.size, quantity: 0 };

    const exportedAndTransferredQuantity = exportItem.quantity + transferItem.quantity;

    return {
      color: importItem.color,
      colorTitle: importItem.colorTitle,
      size: importItem.size, // 👈 THÊM SIZE VÀO KẾT QUẢ
      importedQuantity: importItem.quantity,
      exportedAndTransferredQuantity,
      remainingQuantity: importItem.quantity - exportedAndTransferredQuantity,
    };
  });

  // 8. Tính tổng số lượng nhập
  const totalQuantity = combinedResult.reduce((sum, { importedQuantity }) => sum + importedQuantity, 0);

  return {
    success: true,
    message: combinedResult.length > 0 ? 'Lấy danh sách màu và số lượng thành công' : 'Không có chi tiết màu nào cho sản phẩm này',
    data: combinedResult,
    totalQuantity,
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


async importProducts(file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('File không được tìm thấy');
  }

  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      total: data.length,
      success: 0,
      errors: [] as string[],
      details: [] as any[]
    };

    // Lấy tất cả SKU hiện có để check trùng
    const existingProducts = await this.prisma.product.findMany({
      select: { sku: true }
    });
    const existingSkus = new Set(existingProducts.map(p => p.sku.toLowerCase().trim()));

    // Lấy danh sách categories để validate
    const categories = await this.prisma.category.findMany({
      select: { id: true }
    });
    const validCategoryIds = new Set(categories.map(cat => cat.id));

    for (const [index, row] of data.entries()) {
      try {
        const rowData = row as Record<string, any>;
        
        // 4 FIELD: Tên Sản Phẩm, SKU, Giá, Danh mục (ID)
        const productData = {
          title: String(rowData['Tên Sản Phẩm'] || '').trim(),
          sku: String(rowData['SKU'] || '').trim(),
          price: this.parseNumber(rowData['Giá'] || 0),
          categoryId: rowData['Danh mục'] !== undefined ? Number(rowData['Danh mục']) : null
        };

        // Validate required fields
        if (!productData.title) {
          throw new Error('Tên sản phẩm là bắt buộc');
        }
        if (!productData.sku) {
          throw new Error('SKU là bắt buộc');
        }
        if (productData.price === undefined || productData.price < 0) {
          throw new Error('Giá sản phẩm không hợp lệ');
        }

        // Check trùng SKU
        const normalizedSku = productData.sku.toLowerCase().trim();
        if (existingSkus.has(normalizedSku)) {
          throw new Error(`SKU "${productData.sku}" đã tồn tại`);
        }

        // Validate categoryId nếu có
        if (productData.categoryId !== null) {
          if (isNaN(productData.categoryId)) {
            throw new Error('Danh mục phải là số ID');
          }
          if (!validCategoryIds.has(productData.categoryId)) {
            throw new Error(`Danh mục với ID ${productData.categoryId} không tồn tại`);
          }
        }

        // Tạo slug từ title
        const slug = this.createSlug(productData.title);

        // Create product
        await this.prisma.product.create({
          data: {
            title: productData.title,
            sku: productData.sku,
            price: productData.price,
            categoryId: productData.categoryId,
            slug: slug,
            description: '',
            thumb: '',
            discount: 0,
            discountSingle: 0,
            discountMultiple: 0,
            unit: 'cái',
            weight: 0,
            weightUnit: 'gram',
            quantity: 0,
          }
        });

        // Thêm vào set để tránh trùng trong cùng 1 file import
        existingSkus.add(normalizedSku);
        
        results.success++;
        results.details.push({
          row: index + 2,
          name: productData.title,
          sku: productData.sku,
          price: productData.price,
          categoryId: productData.categoryId,
          status: 'SUCCESS'
        });

      } catch (error: any) {
        const rowNumber = index + 2;
        const errorMessage = `Dòng ${rowNumber}: ${error.message}`;
        
        results.errors.push(errorMessage);
        results.details.push({
          row: rowNumber,
          name: String((row as any)?.['Tên Sản Phẩm'] || 'N/A'),
          status: 'ERROR',
          message: error.message
        });
      }
    }

    return {
      success: true,
      message: `Import hoàn tất: ${results.success}/${results.total} sản phẩm thành công`,
      data: results
    };

  } catch (error: any) {
    throw new BadRequestException('Lỗi khi xử lý file Excel: ' + error.message);
  }
}

  // =============== 2. EXPORT PRODUCTS (3 FIELD) ===============
async exportProducts() {
  try {
    // Lấy tất cả sản phẩm từ database
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        sku: true,
        price: true,
        categoryId: true,
      },
    });

    // Format data để export - chỉ có ID danh mục
    const exportData = products.map(product => ({
      'Tên Sản Phẩm': product.title || '',
      'SKU': product.sku || '',
      'Giá': product.price,
      'Danh mục': product.categoryId || '', // Chỉ export ID
    }));

    // Tạo worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');

    // Định dạng độ rộng cột
    const colWidths = [
      { wch: 40 },   // Tên Sản Phẩm
      { wch: 25 },   // SKU
      { wch: 15 },   // Giá
      { wch: 15 },   // Danh mục (ID)
    ];
    worksheet['!cols'] = colWidths;
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return {
      success: true,
      message: 'Export danh sách sản phẩm thành công',
      data: {
        buffer: buffer,
        fileName: `products_export_${new Date().toISOString().split('T')[0]}.xlsx`
      }
    };
  } catch (error: any) {
    this.logger.error('Lỗi khi export Excel:', error);
    throw new InternalServerErrorException('Lỗi khi xuất file Excel: ' + error.message);
  }
}

  // =============== 3. EXPORT TEMPLATE ===============
async exportTemplate() {
  try {
    // Lấy danh sách categories để làm mẫu
    const categories = await this.prisma.category.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true
      }
    });

    // Tạo template với 4 cột mẫu (Danh mục là ID)
    const templateData = [
      {
        'Tên Sản Phẩm': 'Áo thun nam cổ tròn',
        'SKU': 'ATHUN001',
        'Giá': 150000,
        'Danh mục': categories[0]?.id || 1,
      },
      {
        'Tên Sản Phẩm': 'Quần jean nam',
        'SKU': 'QJEAN001',
        'Giá': 350000,
        'Danh mục': categories[0]?.id || 1,
      },
      {
        'Tên Sản Phẩm': 'Găng tay thể thao',
        'SKU': 'GANTAY001',
        'Giá': 20000,
        'Danh mục': categories[1]?.id || 2,
      },
      {
        'Tên Sản Phẩm': 'Ví da nam cao cấp',
        'SKU': 'VIDA001',
        'Giá': 250000,
        'Danh mục': '', // Mẫu trường hợp không có danh mục
      }
    ];

    // Thêm sheet danh sách categories để tham khảo ID
    const categoryList = categories.map(cat => ({
      'ID': cat.id,
      'Tên danh mục': cat.title
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const categorySheet = XLSX.utils.json_to_sheet(categoryList);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Danh mục');

    // Định dạng độ rộng cột
    const colWidths = [
      { wch: 30 }, // Tên Sản Phẩm
      { wch: 20 }, // SKU
      { wch: 15 }, // Giá
      { wch: 15 }, // Danh mục (ID)
    ];
    worksheet['!cols'] = colWidths;

    // Định dạng cột cho sheet danh mục
    const categoryColWidths = [
      { wch: 10 }, // ID
      { wch: 30 }, // Tên danh mục
    ];
    categorySheet['!cols'] = categoryColWidths;

    // Thêm note hướng dẫn
    const note = [
      ['HƯỚNG DẪN NHẬP LIỆU'],
      ['1. "Danh mục": Nhập ID số của danh mục (xem sheet "Danh mục")'],
      ['2. Để trống nếu sản phẩm không có danh mục'],
      ['3. Giá trị số: Giá phải là số, lớn hơn hoặc bằng 0'],
      ['4. SKU: Không được trùng với sản phẩm hiện có'],
    ];

    const noteSheet = XLSX.utils.aoa_to_sheet(note);
    XLSX.utils.book_append_sheet(workbook, noteSheet, 'Hướng dẫn');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return {
      success: true,
      message: 'Export template thành công',
      data: {
        buffer: buffer,
        fileName: 'product_import_template.xlsx'
      }
    };

  } catch (error: any) {
    this.logger.error('Lỗi khi export template:', error);
    throw new InternalServerErrorException('Lỗi khi xuất template: ' + error.message);
  }
}

  // =============== HELPER FUNCTIONS ===============
private parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }





}
