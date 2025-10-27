import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    IsArray,
    IsEnum,
} from 'class-validator';

export class CreateAmpliacionDto {
    @IsNumber()
    edificio_id: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsDateString()
    fecha_ingreso?: string;

    @IsOptional()
    @IsString()
    proveedor_donante?: string;

    @IsOptional()
    @IsNumber()
    superficie_ampliacion?: number;

    @IsOptional()
    @IsNumber()
    valor_ampliacion?: number;

    @IsOptional()
    @IsString()
    respaldo_legal?: string;

    @IsOptional()
    @IsString()
    descripcion_respaldo_legal?: string;

    @IsOptional()
    @IsArray()
    fotos_ampliacion?: string[];

    @IsOptional()
    @IsString()
    archivo_pdf?: string;

    @IsOptional()
    @IsEnum(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
