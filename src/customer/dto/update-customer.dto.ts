import { IsString, IsEmail, IsOptional, IsPhoneNumber, Matches, IsInt, Min } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

   @IsOptional()
  @IsString()
  mst?: string;  // Mã số thuế (Ví dụ: 0123456789 hoặc 123456789012)

  @IsOptional()  // Trường này là tùy chọn
  @IsInt()  // Đảm bảo là số nguyên
  @Min(0, { message: 'Điểm tích lũy không thể nhỏ hơn 0' })  // Đảm bảo không âm
  loyaltyPoint?: number;
}
