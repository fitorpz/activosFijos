import { Test, TestingModule } from '@nestjs/testing';
import { DireccionesAdministrativasService } from './direcciones-administrativas.service';

describe('DireccionesAdministrativasService', () => {
  let service: DireccionesAdministrativasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DireccionesAdministrativasService],
    }).compile();

    service = module.get<DireccionesAdministrativasService>(DireccionesAdministrativasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
