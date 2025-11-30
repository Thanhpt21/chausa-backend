import { Test, TestingModule } from '@nestjs/testing';
import { PrepaymentService } from './prepayment.service';

describe('PrepaymentService', () => {
  let service: PrepaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrepaymentService],
    }).compile();

    service = module.get<PrepaymentService>(PrepaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
