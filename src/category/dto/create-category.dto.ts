import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

 @IsString()
  @IsOptional() // Cho phép slug không được gửi hoặc là undefined
  slug?: string; // Thay đổi từ slug: string; thành slug?: string;

  @IsString()
  @IsOptional()
  image?: string;


  @IsOptional() // parentId là tùy chọn (có thể là undefined)
  @Transform(({ value }) => {
    if (value === '' || value === 0) { // Thêm điều kiện kiểm tra value === 0
      return null;
    }
    return value;
  })
  
  // ⭐ QUAN TRỌNG: Chỉ xác thực các decorator sau đây nếu parentId KHÔNG phải là null ⭐
  @ValidateIf((obj) => obj.parentId !== null) 
  @IsInt({ message: 'Parent ID phải là số nguyên.' }) // Thông báo lỗi rõ ràng hơn
  @Min(1, { message: 'Parent ID phải lớn hơn hoặc bằng 1.' }) // Thông báo lỗi rõ ràng hơn
  @Type(() => Number) // Đảm bảo chuyển đổi sang kiểu số trước khi validation nếu không phải null
  parentId?: number | null; 
}

