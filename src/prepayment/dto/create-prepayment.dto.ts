import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min, IsDateString, IsString, IsEnum } from 'class-validator';
import { PrepaymentStatus } from '@prisma/client'

export class CreatePrepaymentDto {
  @IsInt({ message: 'customerId phải là số nguyên' })
  @Min(1, { message: 'customerId phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  customerId: number;

  @IsInt({ message: 'amountMoney phải là số nguyên' })
  @Min(0, { message: 'amountMoney phải lớn hơn hoặc bằng 0' })
  @Type(() => Number)
  amountMoney: number;

  @IsOptional()
  date?: string;

  @IsOptional()
  @IsString({ message: 'note phải là chuỗi văn bản' })
  note?: string;

  @IsEnum(PrepaymentStatus, { message: 'Trạng thái không hợp lệ' })
  status?: PrepaymentStatus; // Nếu không có giá trị nào thì sử dụng trạng thái mặc định 'PENDING'
}
