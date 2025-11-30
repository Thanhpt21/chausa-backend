import { Test, TestingModule } from '@nestjs/testing';
import { ProductComboController } from './product-combo.controller';

describe('ProductComboController', () => {
  let controller: ProductComboController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductComboController],
    }).compile();

    controller = module.get<ProductComboController>(ProductComboController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
