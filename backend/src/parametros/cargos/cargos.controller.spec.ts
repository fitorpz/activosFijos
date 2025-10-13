import { Test, TestingModule } from '@nestjs/testing';
import { DireccionesAdministrativasController } from './cargos.controller';
import { DireccionesAdministrativasService } from './cargos.service';

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
