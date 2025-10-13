import { Test, TestingModule } from '@nestjs/testing';
import { EdificiosService } from './edificios.service';

describe('EdificiosService', () => {
  let service: EdificiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdificiosService],
    }).compile();

    service = module.get<EdificiosService>(EdificiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
