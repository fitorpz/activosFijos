import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistritosService } from './distritos.service';
import { DistritosController } from './distritos.controller';
import { Distrito } from './entities/distritos.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Distrito, 
      Usuario,
    ]),
  ],
  controllers: [DistritosController],
  providers: [DistritosService],
})
export class DistritosModule { }
