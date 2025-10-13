import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UfvsService } from './ufvs.service';
import { UfvsController } from './ufvs.controller';
import { Ufv } from './entities/ufvs.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ufv, 
      Usuario,
    ]),
  ],
  controllers: [UfvsController],
  providers: [UfvsService],
})
export class UfvsModule { }
