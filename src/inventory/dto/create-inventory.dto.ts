import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min, IsDateString } from 'class-validator';

export class CreateInventoryDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @Min(1, { message: 'productId phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  productId: number;

  @IsInt({ message: 'quantity phải là số nguyên' })
  @Min(0, { message: 'quantity phải lớn hơn hoặc bằng 0' })
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsDateString({}, { message: 'last_update phải là chuỗi ngày giờ hợp lệ ISO 8601' })
  last_update?: string;
}
