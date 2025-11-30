// src/products/dto/create-product.dto.ts

import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WeightUnit } from '../enums/product.enums'; // Đảm bảo đường dẫn đúng

export class ProductColorDto {
  @IsInt()
  @Type(() => Number)
  colorId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  quantity: number; 

  @IsString()
  @IsOptional() // Chúng ta đánh dấu là tùy chọn vì title có thể được lấy từ bảng Color
  title?: string; // Trường title để lưu tên màu sắc
}


export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  sku: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  discount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountSingle: number; // % giảm khi mua 1 sản phẩm

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountMultiple: number; // % giảm khi mua >= 2 sản phẩm

  @IsOptional()
  @Type(() => Number)
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

  @IsOptional()
  colors?: ProductColorDto[];
}
