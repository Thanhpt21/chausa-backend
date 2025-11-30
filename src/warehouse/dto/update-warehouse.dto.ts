import { IsString, IsOptional, IsDate } from 'class-validator';

export class UpdateWarehouseDto {
  @IsOptional() // Chỉ cần truyền khi cần cập nhật trường này
  @IsString()
  name?: string; // Tên kho hàng

  @IsOptional()
  @IsString()
  address?: string; // Địa chỉ kho hàng

  @IsOptional()
  @IsDate()
  createdAt?: Date; // Ngày tạo (thường không cập nhật)

  @IsOptional()
  @IsDate()
  updatedAt?: Date; // Ngày cập nhật
}
