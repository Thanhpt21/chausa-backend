import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateColorDto {
  @IsOptional()  // title là tùy chọn khi cập nhật
  @IsString()
  @IsNotEmpty()
  title?: string; // Tên màu, có thể cập nhật hoặc không

  @IsOptional()  // sku là tùy chọn khi cập nhật
  @IsString()
  @IsNotEmpty()
  sku?: string; // Mã SKU của màu sắc, có thể cập nhật hoặc không

}
