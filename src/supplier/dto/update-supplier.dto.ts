import { IsString, IsEmail, IsOptional, Matches } from 'class-validator';

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,12}$/, { message: 'Mã số thuế phải là một chuỗi số từ 10 đến 12 ký tự' })
  mst?: string;  // Mã số thuế (Ví dụ: 0123456789 hoặc 123456789012)
}
