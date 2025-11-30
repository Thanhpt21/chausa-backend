import { IsEnum, IsOptional, IsString, IsInt, IsPositive, IsDateString } from 'class-validator'
import { PurchaseRequestStatus } from '@prisma/client'

export class CreatePurchaseRequestDto {
  @IsEnum(PurchaseRequestStatus, { message: 'Trạng thái không hợp lệ' })
  status: PurchaseRequestStatus

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string

  @IsInt({ message: 'supplierId phải là số nguyên' })
  @IsPositive({ message: 'supplierId phải là một số dương' })
  supplierId: number

  @IsOptional()
  @IsDateString()
  purchase_date?: string
}
