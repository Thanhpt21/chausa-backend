import { IsInt, IsPositive, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePurchaseRequestDetailDto {
  @IsInt()
  purchaseRequestId: number;  // Thay importId bằng purchaseRequestId

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  color: number;

  @IsString()
  colorTitle: string;

  @IsString()
  size: string;

}
