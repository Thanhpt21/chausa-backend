import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;  // Khóa chính, tự động tăng

  @Column()
  name: string;  // Tên đầy đủ người dùng

  @Column({ unique: true })
  email: string;      // Địa chỉ email (unique)

  @Column()
  password: string;   // Mật khẩu người dùng (nên mã hóa trước khi lưu)

  @Column({ default: 'customer' })
  role: string;       // Vai trò người dùng, ví dụ 'customer' hoặc 'admin'

  @Column({ nullable: true })
  profilePicture: string; // Đường dẫn ảnh đại diện người dùng

  @Column({ default: true })
  isActive: boolean; // Trạng thái tài khoản (kích hoạt hay khóa)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;   // Thời gian tạo tài khoản

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;   // Thời gian cập nhật tài khoản

  @Column({ nullable: true })
  phoneNumber: string;  // Số điện thoại của người dùng

  @Column({ nullable: true })
  gender: string;  // Giới tính người dùng (có thể là 'male', 'female', 'other')
  
  @Column({ default: 'normal' })
  type_account: string; // 'normal' | 'google' | 'facebook'
}
