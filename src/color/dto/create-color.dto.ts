import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Tên màu, không được để trống và phải là chuỗi

  @IsOptional()
  @IsString()
  sku?: string | null;
}
