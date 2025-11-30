import { IsInt, IsPositive, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateImportDetailDto {
  @IsInt()
  @IsOptional()
  importId?: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  color?: number;  

  @IsString()
  @IsOptional()
  colorTitle?: string;

  @IsString()
  @IsOptional()
  size?: string; // 🔥 THÊM SIZE

  @IsString()
  @IsOptional()
  unit?: string;
}