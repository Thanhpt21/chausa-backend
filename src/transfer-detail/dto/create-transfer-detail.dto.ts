import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransferDetailDto {
  @IsInt()
  transferId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsInt()
  color: number;

  @IsString()
  colorTitle: string;

    @IsString()
  size: string;

  @IsNumber()
  @IsOptional()
  finalPrice?: number;

  @IsString()
  unit?: string;
}
