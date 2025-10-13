import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GruposContablesService } from './grupos-contables.service';
import { GruposContablesController } from './grupos-contables.controller';
import { GrupoContable } from './entities/grupos-contables.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GrupoContable, // 👈 este es el repositorio que estaba faltando
      Usuario,
    ]),
  ],
  controllers: [GruposContablesController],
  providers: [GruposContablesService],
})

export class GruposContablesModule { }
