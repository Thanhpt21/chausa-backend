import { IsInt, IsPositive, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePurchaseRequestDetailDto {
  @IsInt()
  @IsOptional()
  purchaseRequestId?: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  color?: number;

  @IsString()
  @IsOptional()
  colorTitle?: string;


  @IsString()
  size: string;

}