import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Tên màu, không được để trống và phải là chuỗi

  @IsString()
  @IsNotEmpty()
  sku: string; // Mã SKU của màu sắc, không được để trống và phải là chuỗi

}
