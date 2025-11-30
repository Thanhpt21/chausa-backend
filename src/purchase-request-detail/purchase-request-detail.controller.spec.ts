import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestDetailController } from './purchase-request-detail.controller';

describe('PurchaseRequestDetailController', () => {
  let controller: PurchaseRequestDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseRequestDetailController],
    }).compile();

    controller = module.get<PurchaseRequestDetailController>(PurchaseRequestDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
