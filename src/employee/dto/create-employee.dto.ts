import { IsString, IsEmail, IsOptional, IsNumber, Min, IsBoolean, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsNumber()
  @Min(0, { message: 'Lương cơ bản không thể nhỏ hơn 0' })
  baseSalary: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  note?: string;
}