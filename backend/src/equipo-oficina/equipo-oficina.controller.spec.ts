import { Test, TestingModule } from '@nestjs/testing';
import { EquipoOficinaController } from './equipo-oficina.controller';

describe('EquipoOficinaController', () => {
  let controller: EquipoOficinaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipoOficinaController],
    }).compile();

    controller = module.get<EquipoOficinaController>(EquipoOficinaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
