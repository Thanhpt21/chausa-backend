import { IsInt, IsNumber, Min, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { SalaryStatus } from '@prisma/client';

export class UpdateSalaryDto {

  @IsOptional()
  @IsInt()
  employeeId?: number;
  
  @IsOptional()
  @IsInt()
  month?: number;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  actualWorkDays?: number;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  netSalary?: number;

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