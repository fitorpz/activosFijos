import {
    IsString,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDateString,
    IsArray,
    IsDecimal,
} from 'class-validator';

export class CreateEdificioDto {
    @IsString()
    nro_da: string;

    @IsNumber()
    responsable_id: number;

    @IsNumber()
    cargo_id: number;

    @IsNumber()
    unidad_organizacional_id: number;

    @IsString()
    ubicacion: string;

    @IsString()
    ingreso: string;

    @IsString()
    descripcion_ingreso: string;

    @IsDateString()
    fecha_factura_donacion: string;

    @IsOptional()
    @IsString()
    nro_factura?: string;

    @IsOptional()
    @IsString()
    proveedor_donante?: string;

    @IsString()
    nombre_bien: string;

    @IsString()
    respaldo_legal: string;

    @IsString()
    descripcion_respaldo_legal: string;

    @IsString()
    clasificacion: string;

    @IsString()
    uso: string;

    @IsNumber()
    superficie: number;

    @IsArray()
    @IsString({ each: true })
    servicios: string[];

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsString()
    estado_conservacion: string;

    @IsNumber()
    valor_bs: number;

    @IsNumber()
    vida_util_anios: number;

    @IsArray()
    @IsString({ each: true })
    fotos_edificio: string[];

    @IsString()
    archivo_respaldo_pdf: string;

    @IsNumber()
    creado_por_id: number;

    @IsOptional()
    @IsNumber()
    actualizado_por_id?: number;

    @IsOptional()
    @IsEnum(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
