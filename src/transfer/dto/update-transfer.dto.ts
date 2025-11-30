import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { TransferStatus } from '@prisma/client';

export class UpdateTransferDto {
  @IsOptional()
  @IsEnum(TransferStatus, { message: 'Trạng thái không hợp lệ' })
  status?: TransferStatus;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsOptional()
  @IsInt({ message: 'customerId phải là số nguyên' })
  @IsPositive({ message: 'customerId phải là số dương' })
  customerId?: number;

  @IsOptional()
  @IsDateString()
  transfer_date?: string;

  
  @IsOptional()
  @IsBoolean({ message: 'isInternal phải là boolean' })
  isInternal?: boolean;
}