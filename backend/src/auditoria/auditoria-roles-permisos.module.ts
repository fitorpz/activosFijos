import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaRolesPermisos } from './entities/auditoria-roles-permisos.entity';
import { AuditoriaRolesPermisosService } from './auditoria-roles-permisos.service';

@Module({
    imports: [TypeOrmModule.forFeature([AuditoriaRolesPermisos])],
    providers: [AuditoriaRolesPermisosService],
    exports: [AuditoriaRolesPermisosService],
})
export class AuditoriaRolesPermisosModule { }
