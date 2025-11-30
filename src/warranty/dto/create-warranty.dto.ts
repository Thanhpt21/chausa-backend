import { IsString, IsBoolean, IsInt, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateWarrantyDto {
  @IsString()
  @MaxLength(1000)
  note: string; // Ghi chú bảo hành

  @IsBoolean()
  @IsOptional()
  isResolved?: boolean = false; // Trạng thái đã xử lý hay chưa, mặc định là false

  @IsInt()
  @Min(1)
  quantity: number; // Số lượng bảo hành

  @IsString()
  @MaxLength(255)
  colorTitle: string; // Tên màu sắc

  @IsString()
  @MaxLength(255)
  title: string; // Tên sản phẩm

  @IsString()
  @MaxLength(255)
  model: string; // Mã model sản phẩm
}