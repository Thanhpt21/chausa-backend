import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class UpdateComboDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
    
}
