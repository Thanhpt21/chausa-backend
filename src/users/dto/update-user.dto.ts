import { IsString, IsOptional, IsEmail, IsEnum, IsPhoneNumber, ValidateIf } from 'class-validator';
import { AccountType, UserRole } from '../enums/user.enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @ValidateIf(o => o.phoneNumber !== null)
  phoneNumber?: string | null; 

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(AccountType)
  type_account?: AccountType;
}
