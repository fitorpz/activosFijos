import { Module } from '@nestjs/common';
import { UserLogController } from './user-log.controller';
import { UserLogService } from './user-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLog } from './entities/user-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLog])],
  controllers: [UserLogController],
  providers: [UserLogService],
  exports: [UserLogService], // 👈 esto es lo que permite usarlo en otros módulos
})
export class UserLogModule { }
