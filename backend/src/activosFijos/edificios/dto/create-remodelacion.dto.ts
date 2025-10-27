import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    IsArray,
    IsEnum,
} from 'class-validator';

export class CreateRemodelacionDto {
    @IsNumber()
    edificio_id: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsDateString()
    fecha_factura_donacion?: string;

    @IsOptional()
    @IsString()
    nro_factura?: string;

    @IsOptional()
    @IsString()
    proveedor_donante?: string;

    @IsOptional()
    @IsNumber()
    superficie_remodelacion?: number;

    @IsOptional()
    @IsNumber()
    valor_remodelacion?: number;

    @IsOptional()
    @IsString()
    respaldo_legal?: string;

    @IsOptional()
    @IsString()
    descripcion_respaldo_legal?: string;

    @IsOptional()
    @IsArray()
    fotos_remodelacion?: string[];

    @IsOptional()
    @IsString()
    archivo_pdf?: string;

    @IsOptional()
    @IsEnum(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
