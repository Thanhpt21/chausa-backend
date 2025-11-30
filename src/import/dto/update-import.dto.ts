import { IsEnum, IsOptional, IsString, IsInt, IsPositive, IsDateString, IsBoolean, IsNumber, Min } from 'class-validator'
import { ImportStatus } from '@prisma/client'

export class UpdateImportDto {
  @IsOptional()
  @IsEnum(ImportStatus, { message: 'Trạng thái không hợp lệ' })
  status?: ImportStatus

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string

  @IsOptional()  // Trường này là tùy chọn, có thể không cung cấp khi cập nhật
  @IsInt({ message: 'supplierId phải là số nguyên' })
  @IsPositive({ message: 'supplierId phải là một số dương' })
  supplierId?: number

   @IsOptional()
  @IsDateString()
  import_date?: string  

  @IsOptional()
  @IsNumber({}, { message: 'extra_cost phải là số' })
  @Min(0, { message: 'extra_cost không được nhỏ hơn 0' })
  extra_cost?: number

  @IsOptional()
  @IsBoolean({ message: 'isInternal phải là kiểu boolean' })
  isInternal?: boolean
}
