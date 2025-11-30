import { IsInt, IsPositive, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateImportDetailDto {
  @IsInt()
  importId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  color: number;  

  @IsString()
  colorTitle: string;

  @IsString()
  size: string;

  @IsString()
  @IsOptional()
  unit?: string;
}