import { Test, TestingModule } from '@nestjs/testing';
import { EquipoOficinaService } from './equipo-oficina.service';

describe('EquipoOficinaService', () => {
  let service: EquipoOficinaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipoOficinaService],
    }).compile();

    service = module.get<EquipoOficinaService>(EquipoOficinaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
