import { Test, TestingModule } from '@nestjs/testing';
import { DireccionesAdministrativasController } from './areas.controller';
import { DireccionesAdministrativasService } from './areas.service';

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
