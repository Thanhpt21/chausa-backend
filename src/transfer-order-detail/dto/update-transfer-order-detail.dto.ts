import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTransferOrderDetailDto {
  @IsInt()
  @IsOptional()
  transferId?: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsInt()
  @IsOptional()
  color?: number;

  @IsString()
  @IsOptional()
  colorTitle?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;


  @IsNumber()
  @IsOptional()
  finalPrice?: number;
  
}
