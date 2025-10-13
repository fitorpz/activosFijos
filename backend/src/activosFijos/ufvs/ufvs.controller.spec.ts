import { Test, TestingModule } from '@nestjs/testing';
import { UfvsController } from './ufvs.controller';
import { UfvsService } from './ufvs.service';

describe('UfvsController', () => {
  let controller: UfvsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UfvsController],
      providers: [UfvsService],
    }).compile();

    controller = module.get<UfvsController>(UfvsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
