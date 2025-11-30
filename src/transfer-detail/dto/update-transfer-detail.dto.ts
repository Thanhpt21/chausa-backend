import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTransferDetailDto {
  @IsInt()
  @IsOptional()
  transferId?: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsInt()
  @IsOptional()
  color?: number;

  @IsString()
  @IsOptional()
  colorTitle?: string;

    @IsString()
  size: string;

  @IsNumber()
  @IsOptional()
  finalPrice?: number;

  @IsString()
  unit?: string;
}
