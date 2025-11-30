import { IsString } from 'class-validator';

export class CreateProjectCategoryDto {
  @IsString({ message: 'Title phải là chuỗi' })
  title: string;
}
