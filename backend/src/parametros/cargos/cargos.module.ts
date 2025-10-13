import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargosService } from './cargos.service';
import { CargosController } from './cargos.controller';
import { Cargo } from './entities/cargos.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cargo, 
      Usuario,
    ]),
  ],
  controllers: [CargosController],
  providers: [CargosService],
})
export class CargosModule { }
