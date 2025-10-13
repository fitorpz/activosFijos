import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateRolDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsArray()
    permisos?: number[]; // Array de IDs de permisos
}
