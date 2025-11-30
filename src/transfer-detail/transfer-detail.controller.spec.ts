import { Test, TestingModule } from '@nestjs/testing';
import { TransferDetailController } from './transfer-detail.controller';

describe('TransferDetailController', () => {
  let controller: TransferDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferDetailController],
    }).compile();

    controller = module.get<TransferDetailController>(TransferDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
