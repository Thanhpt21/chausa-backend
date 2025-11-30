import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class UpdateProductInComboDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  color?: number;

  @IsOptional()
  @IsString()
  colorTitle?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Min(0)
  finalPrice?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
