import { IsString, IsOptional, IsEmail, IsEnum, IsPhoneNumber } from 'class-validator';
import { AccountType } from '../enums/user.enums';


export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(['customer', 'admin'])
  role?: string; // default là 'customer'

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsEnum(AccountType)
  type_account?: AccountType;
}