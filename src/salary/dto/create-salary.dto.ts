import { IsInt, IsNumber, Min, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { SalaryStatus } from '@prisma/client';

export class CreateSalaryDto {
  @IsInt()
  employeeId: number;

  @IsInt()
  @Min(1)
  @Min(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;

  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsInt()
  @Min(0)
  actualWorkDays: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWorkHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  leaveDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leaveHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deduction?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowance?: number;

  @IsNumber()
  @Min(0)
  netSalary: number;

  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}