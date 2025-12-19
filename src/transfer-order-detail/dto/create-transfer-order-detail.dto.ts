import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTransferOrderDetailDto {
  @IsInt()
  transferId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  color: number;

  @IsString()
  colorTitle: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
