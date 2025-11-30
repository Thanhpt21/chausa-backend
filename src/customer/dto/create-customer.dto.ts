import { IsString, IsEmail, Matches, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

   @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  email: string | null;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  mst: string;  // Mã số thuế (Ví dụ: 0123456789 hoặc 123456789012)

  @IsInt()
  @Min(0, { message: 'Điểm tích lũy không thể nhỏ hơn 0' })
  @IsOptional() // Trường này là tùy chọn, nếu không có, mặc định sẽ là 0 trong cơ sở dữ liệu
  loyaltyPoint: number;
}
