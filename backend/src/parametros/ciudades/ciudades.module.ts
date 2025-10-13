import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadesService } from './ciudades.service';
import { CiudadesController } from './ciudades.controller';
import { Ciudad } from './entities/ciudades.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ciudad, 
      Usuario,
    ]),
  ],
  controllers: [CiudadesController],
  providers: [CiudadesService],
})
export class CiudadesModule { }
