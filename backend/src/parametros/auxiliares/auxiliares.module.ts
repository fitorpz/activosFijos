import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuxiliaresService } from './auxiliares.service';
import { AuxiliaresController } from './auxiliares.controller';
import { Auxiliar } from './entities/auxiliares.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auxiliar, 
      Usuario,
    ]),
  ],
  controllers: [AuxiliaresController],
  providers: [AuxiliaresService],
})
export class AuxiliaresModule { }
