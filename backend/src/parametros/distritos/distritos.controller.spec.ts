import { Test, TestingModule } from '@nestjs/testing';
import { DistritosController } from './distritos.controller';
import { DistritosService } from './distritos.service';

describe('DistritosController', () => {
  let controller: DistritosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistritosController],
      providers: [DistritosService],
    }).compile();

    controller = module.get<DistritosController>(DistritosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
