import { Test, TestingModule } from '@nestjs/testing';
import { ProductComboService } from './product-combo.service';

describe('ProductComboService', () => {
  let service: ProductComboService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductComboService],
    }).compile();

    service = module.get<ProductComboService>(ProductComboService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
