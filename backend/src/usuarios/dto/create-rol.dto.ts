// src/usuarios/dto/create-rol.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRolDto {
    @IsString()
    nombre: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsArray()
    permisos?: number[]; // IDs de permisos
}
