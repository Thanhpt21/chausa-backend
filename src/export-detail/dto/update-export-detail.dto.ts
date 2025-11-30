import { IsInt, IsPositive, IsNumber, IsOptional, Min, IsString, Max } from 'class-validator';

export class UpdateExportDetailDto {
  @IsInt()
  @IsOptional()
  exportId?: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;


  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  @IsNumber()
  color?: number;  

  @IsString()
  @IsOptional()
  colorTitle?: string;

    @IsString()
  size: string;

  @IsString()
  unit?: string;

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
