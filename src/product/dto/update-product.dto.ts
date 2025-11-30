import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { WeightUnit } from '../enums/product.enums'; // Đảm bảo đường dẫn đúng

export class ProductColorDto {
  @IsInt()
  @Type(() => Number)
  colorId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  quantity?: number; // Số lượng sản phẩm có thể cập nhật

   @IsString()
  @IsOptional() 
  title?: string; // Trường title để lưu tên màu sắc
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string; // Giữ nếu bạn muốn cập nhật mã sản phẩm

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountSingle?: number; // % giảm khi mua 1 sản phẩm

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountMultiple?: number; // % giảm khi mua >= 2 sản phẩm

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  thumb?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @IsOptional()
  @IsString()
  unit?: string;

  // Mảng màu sắc có thể cập nhật, mỗi đối tượng có colorId và quantity
  @IsOptional()
  colors?: ProductColorDto[];
}
