import { Test, TestingModule } from '@nestjs/testing';
import { TransferDetailService } from './transfer-detail.service';

describe('TransferDetailService', () => {
  let service: TransferDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransferDetailService],
    }).compile();

    service = module.get<TransferDetailService>(TransferDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
