import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateUnidadOrganizacionalDto {
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsEnum(['ACTIVO', 'INACTIVO'])
    @IsOptional()
    estado?: 'ACTIVO' | 'INACTIVO';

    @IsNumber()
    area_id: number;

    @IsNumber()
    creado_por_id: number;
}
