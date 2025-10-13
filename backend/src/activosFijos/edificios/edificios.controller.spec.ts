import { Test, TestingModule } from '@nestjs/testing';
import { EdificiosController } from './edificios.controller';

describe('EdificiosController', () => {
  let controller: EdificiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdificiosController],
    }).compile();

    controller = module.get<EdificiosController>(EdificiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
