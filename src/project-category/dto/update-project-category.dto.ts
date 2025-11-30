import { IsOptional, IsString } from "class-validator";

export class UpdateProjectCategoryDto {
  @IsOptional()
  @IsString({ message: 'Title phải là chuỗi' })
  title?: string;
}