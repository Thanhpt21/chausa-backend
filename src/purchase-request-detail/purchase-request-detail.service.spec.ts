import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRequestDetailService } from './purchase-request-detail.service';

describe('PurchaseRequestDetailService', () => {
  let service: PurchaseRequestDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseRequestDetailService],
    }).compile();

    service = module.get<PurchaseRequestDetailService>(PurchaseRequestDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
