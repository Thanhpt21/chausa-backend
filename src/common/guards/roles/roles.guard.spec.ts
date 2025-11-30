import { Reflector } from '@nestjs/core'; // Thêm import này
import { RolesGuard } from './roles.guard';
import { Test, TestingModule } from '@nestjs/testing'; // Đảm bảo import Test và TestingModule

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector; // Khai báo reflector

  beforeEach(async () => {
    // Sử dụng TestingModule để tạo một môi trường test cho Guard
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          // Cung cấp một mock cho Reflector
          provide: Reflector,
          useValue: {
            // Giả lập các phương thức mà RolesGuard của bạn có thể gọi trên Reflector
            // Ví dụ: get(key, context)
            get: jest.fn(), // Hoặc một hàm mock cụ thể hơn nếu cần
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector); // Lấy instance của mock reflector

  });

  it('should be defined', () => {
    // Bây giờ bạn có thể kiểm tra guard đã được định nghĩa
    // Nó đã được tạo thông qua module.get, không phải new RolesGuard()
    expect(guard).toBeDefined();
  });

  // Viết thêm các test cases khác ở đây
  // Ví dụ: kiểm tra canActivate dựa trên vai trò
});