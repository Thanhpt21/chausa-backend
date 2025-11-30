import { IsString, IsOptional, IsDate, IsInt, Min } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name: string; // Tên kho hàng

  @IsString()
  address: string; // Địa chỉ kho hàng

  @IsOptional()
  @IsDate()
  createdAt?: Date; // Ngày tạo, nếu có thể được optional

  @IsOptional()
  @IsDate()
  updatedAt?: Date; // Ngày cập nhật, nếu có thể được optional

}
