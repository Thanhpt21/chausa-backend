import { IsEnum, IsOptional, IsString, IsInt, IsPositive, IsDateString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ExportStatus } from '@prisma/client';

export class UpdateExportDto {
  @IsOptional()
  @IsEnum(ExportStatus, { message: 'Trạng thái không hợp lệ' })
  status?: ExportStatus;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsOptional()
  @IsInt({ message: 'customerId phải là số nguyên' })
  @IsPositive({ message: 'customerId phải là một số dương' })
  customerId?: number;



  @IsOptional()
  @IsDateString()
  export_date?: string;

  @IsOptional()
  extra_cost?: number;

  @IsOptional()
  additional_cost?: number;

  @IsOptional()
  @IsNumber({}, { message: 'vat phải là số' })
  @Min(0, { message: 'vat phải lớn hơn hoặc bằng 0' })
  @Max(100, { message: 'vat phải nhỏ hơn hoặc bằng 100' })
  vat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'vat phải là số' })
  @Min(0, { message: 'vat phải lớn hơn hoặc bằng 0' })
  @Max(100, { message: 'vat phải nhỏ hơn hoặc bằng 100' })
  pitRate?: number;

  @IsOptional()
  @IsInt({ message: 'prepaymentId phải là số nguyên' })
  @IsPositive({ message: 'prepaymentId phải là số dương' })
  prepaymentId?: number;

  @IsOptional()
  @IsBoolean({ message: 'applyLoyaltyPoint phải là true hoặc false' })
  applyLoyaltyPoint?: boolean;

  @IsOptional()
  @IsInt({ message: 'loyaltyPointUsed phải là số nguyên' })
  @Min(0, { message: 'loyaltyPointUsed phải lớn hơn hoặc bằng 0' })
  loyaltyPointUsed?: number;

  @IsOptional()
  @IsNumber({}, { message: 'loyaltyPointAmount phải là số' })
  @Min(0, { message: 'loyaltyPointAmount phải lớn hơn hoặc bằng 0' })
  loyaltyPointAmount?: number;

  @IsOptional()
  @IsBoolean({ message: 'isProject phải là kiểu boolean' })
  isProject?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'advancePercent phải là số' })
  @Min(0, { message: 'advancePercent phải từ 0 đến 100' })
  @Max(100, { message: 'advancePercent phải từ 0 đến 100' })
  advancePercent?: number;
}
