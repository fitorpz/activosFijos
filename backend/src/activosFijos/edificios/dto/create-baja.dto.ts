import {
    IsString,
    IsOptional,
    IsNumber,
    IsArray,
    IsEnum,
} from 'class-validator';

export class CreateBajaDto {
    @IsNumber()
    edificio_id: number;

    @IsOptional()
    @IsString()
    respaldo_legal?: string;

    @IsOptional()
    @IsString()
    descripcion_respaldo_legal?: string;

    @IsOptional()
    @IsNumber()
    superficie_desmantelamiento?: number;

    @IsOptional()
    @IsNumber()
    valor_ufv?: number;

    @IsOptional()
    @IsArray()
    fotos_baja?: string[];

    @IsOptional()
    @IsString()
    archivo_pdf?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsOptional()
    @IsEnum(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
