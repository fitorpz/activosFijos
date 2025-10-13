import { Test, TestingModule } from '@nestjs/testing';
import { UfvsService } from './ufvs.service';

describe('NucleosService', () => {
  let service: UfvsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UfvsService],
    }).compile();

    service = module.get<UfvsService>(UfvsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
