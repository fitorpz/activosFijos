import { PartialType } from '@nestjs/mapped-types';
import { CreateEdificioDto } from './create-edificio.dto';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateEdificioDto extends PartialType(CreateEdificioDto) {
    // 🔹 IDs de referencia (opcionales pero tipados explícitamente)
    @IsOptional()
    @IsNumber()
    responsable_id?: number;

    @IsOptional()
    @IsNumber()
    cargo_id?: number;

    @IsOptional()
    @IsNumber()
    unidad_organizacional_id?: number;

    @IsOptional()
    @IsNumber()
    actualizado_por_id?: number;

    // 🔹 Campos de codificación (opcionales y editables)
    @IsOptional()
    @IsString()
    codigo_direccion_administrativa?: string;

    @IsOptional()
    @IsString()
    codigo_distrito?: string;

    @IsOptional()
    @IsString()
    codigo_sector_area?: string;

    @IsOptional()
    @IsString()
    codigo_unidad_organizacional?: string;

    @IsOptional()
    @IsString()
    codigo_cargo?: string;

    @IsOptional()
    @IsString()
    codigo_ambiente?: string;

    @IsOptional()
    @IsString()
    codigo_grupo_contable?: string;

    @IsOptional()
    @IsString()
    codigo_correlativo?: string;
}
