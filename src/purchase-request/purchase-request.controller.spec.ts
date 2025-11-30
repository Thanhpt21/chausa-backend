import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestController } from './purchase-request.controller';

describe('PurchaseRequestController', () => {
  let controller: PurchaseRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseRequestController],
    }).compile();

    controller = module.get<PurchaseRequestController>(PurchaseRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
