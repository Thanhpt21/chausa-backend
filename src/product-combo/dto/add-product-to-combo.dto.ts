import { IsInt, IsNotEmpty, IsOptional, Min, IsString } from 'class-validator';

export class AddProductToComboDto {
  @IsInt()
  comboId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number = 1;

  @IsOptional()
  @Min(0)
  unitPrice?: number = 0;

  @IsOptional()
  @IsInt()
  color?: number = 0;

  @IsOptional()
  @IsString()
  colorTitle?: string = '';

  @IsOptional()
  @IsString()
  unit?: string = 'cái';

  @IsOptional()
  @Min(0)
  finalPrice?: number = 0;

  @IsOptional()
  @IsString()
  note?: string = '';
}
