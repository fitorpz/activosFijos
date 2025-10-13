import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NucleosService } from './nucleos.service';
import { NucleosController } from './nucleos.controller';
import { Nucleo } from './entities/nucleos.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Nucleo, 
      Usuario,
    ]),
  ],
  controllers: [NucleosController],
  providers: [NucleosService],
})
export class NucleosModule { }
