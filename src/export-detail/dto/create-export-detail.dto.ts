import { IsInt, IsPositive, IsNumber, Min, IsOptional, IsString, Max } from 'class-validator';

export class CreateExportDetailDto {
  @IsInt()
  exportId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitPrice: number;
  
  @IsString()
  @IsOptional()
  note?: string; // Ghi chú
  
  @IsNumber()
  color: number;  

  @IsString()
  colorTitle: string;

    @IsString()
  size: string;

  @IsString()
  unit?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  @IsOptional()
  finalPrice?: number;

  @IsInt()
  @IsOptional()
  projectCategoryId?: number; 

  @IsInt()
  @IsOptional()
  projectCategoryOrder?: number; 

  @IsString()
  @IsOptional()
  projectCategoryTitle?: string;
}
