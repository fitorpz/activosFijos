import { Test, TestingModule } from '@nestjs/testing';
import { NucleosService } from './nucleos.service';

describe('NucleosService', () => {
  let service: NucleosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NucleosService],
    }).compile();

    service = module.get<NucleosService>(NucleosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
