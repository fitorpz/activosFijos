// src/usuarios/dto/create-permiso.dto.ts

import { IsString } from 'class-validator';

export class CreatePermisoDto {
    @IsString()
    nombre: string;

    @IsString()
    descripcion: string;

    @IsString()
    modulo: string;
}
