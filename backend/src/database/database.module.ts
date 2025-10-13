// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from '../usuarios/entities/permiso.entity';
import { PermisosSeed } from './seeds/permisos.seed';

@Module({
    imports: [TypeOrmModule.forFeature([Permiso])],
    providers: [PermisosSeed],
})
export class DatabaseModule { }
