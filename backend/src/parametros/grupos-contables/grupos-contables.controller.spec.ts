import { Test, TestingModule } from '@nestjs/testing';
import { DireccionesAdministrativasController } from './direcciones-administrativas.controller';
import { DireccionesAdministrativasService } from './direcciones-administrativas.service';

describe('DireccionesAdministrativasController', () => {
  let controller: DireccionesAdministrativasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DireccionesAdministrativasController],
      providers: [DireccionesAdministrativasService],
    }).compile();

    controller = module.get<DireccionesAdministrativasController>(DireccionesAdministrativasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
