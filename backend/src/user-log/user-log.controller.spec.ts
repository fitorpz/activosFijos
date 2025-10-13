import { Test, TestingModule } from '@nestjs/testing';
import { UserLogController } from './user-log.controller';

describe('UserLogController', () => {
  let controller: UserLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLogController],
    }).compile();

    controller = module.get<UserLogController>(UserLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
