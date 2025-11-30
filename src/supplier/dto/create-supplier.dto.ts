import { IsString, IsEmail, Matches, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  email: string | null;

  @IsString()
  address: string;

   @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,12}$/, { message: 'Mã số thuế phải là một chuỗi số từ 10 đến 12 ký tự' })
  mst: string | null;  // Mã số thuế (Ví dụ: 0123456789 hoặc 123456789012)
}
