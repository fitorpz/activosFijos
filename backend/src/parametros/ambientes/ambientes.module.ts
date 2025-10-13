// src/parametros/ambientes/ambientes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbientesController } from './ambientes.controller';
import { AmbientesService } from './ambientes.service';
import { Ambiente } from './entities/ambiente.entity';
import { UnidadOrganizacional } from '../unidades-organizacionales/entities/unidad-organizacional.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module'; // ✅ Asegúrate de importar esto

@Module({
  imports: [
    TypeOrmModule.forFeature([Ambiente, UnidadOrganizacional, Usuario]),
    UsuariosModule, // ✅ Agregado aquí
  ],
  exports: [TypeOrmModule],
  controllers: [AmbientesController],
  providers: [AmbientesService],
})
export class AmbientesModule { }
