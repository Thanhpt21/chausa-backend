import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsDateString,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { TransferStatus } from '@prisma/client';

export class CreateTransferDto {
  @IsEnum(TransferStatus, { message: 'Trạng thái không hợp lệ' })
  status: TransferStatus;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsInt({ message: 'customerId phải là số nguyên' })
  @IsPositive({ message: 'customerId phải là số dương' })
  customerId: number;

  @IsDateString()
  transfer_date: string;

  @IsBoolean({ message: 'isInternal phải là boolean' })
  isInternal: boolean;

}
