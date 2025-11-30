import { IsString, IsBoolean, IsOptional, IsInt, MaxLength, Min } from 'class-validator';

export class UpdateWarrantyDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;
  
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  colorTitle?: string;

  
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;
}