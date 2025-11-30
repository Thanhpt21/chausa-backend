import { Test, TestingModule } from '@nestjs/testing';
import { PrepaymentController } from './prepayment.controller';

describe('PrepaymentController', () => {
  let controller: PrepaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrepaymentController],
    }).compile();

    controller = module.get<PrepaymentController>(PrepaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
