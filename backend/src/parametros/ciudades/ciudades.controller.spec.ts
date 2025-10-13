import { Test, TestingModule } from '@nestjs/testing';
import { CiudadesController } from './ciudades.control./ciudades.controller
import { CiudadDireccionesAdministrativasService } ./ciudades.serviceervice';

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
