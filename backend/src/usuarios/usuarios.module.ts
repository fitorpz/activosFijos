import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';

import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';

import { UserLogModule } from '../user-log/user-log.module';
import { AuditoriaRolesPermisosModule } from 'src/auditoria/auditoria-roles-permisos.module';

import { PermisosModule } from './permisos.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, Permiso]),
    UserLogModule,
    AuditoriaRolesPermisosModule,
    PermisosModule,
  ],
  controllers: [
    UsuariosController,
    RolesController,        // <-- Agrega el controller de roles
    PermisosController,     // <-- Agrega el controller de permisos (si lo tienes)
  ],
  providers: [
    UsuariosService,
    RolesService,           // <-- Agrega el service de roles
    PermisosService,        // <-- Agrega el service de permisos (si lo tienes)
  ],
  exports: [UsuariosService, RolesService, PermisosService],
})
export class UsuariosModule { }
