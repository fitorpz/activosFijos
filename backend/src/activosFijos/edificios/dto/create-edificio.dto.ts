import {
    IsString,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDateString,
    IsArray,
    IsDecimal,
    Length,
} from 'class-validator';

export class CreateEdificioDto {
    // 🔹 Codificación GAMS Sucre (10 niveles)
    @IsOptional()
    @IsString()
    codigo_gobierno?: string = 'GAMS'; // 1

    @IsOptional()
    @IsString()
    codigo_institucional?: string = '1101'; // 2

    @IsString()
    @Length(1, 10)
    codigo_direccion_administrativa: string; // 3

    @IsString()
    @Length(1, 10)
    codigo_distrito: string; // 4

    @IsString()
    @Length(1, 10)
    codigo_sector_area: string; // 5

    @IsString()
    @Length(1, 10)
    codigo_unidad_organizacional: string; // 6

    @IsNumber()
    unidad_organizacional_id: number;

    @IsString()
    @Length(1, 10)
    codigo_cargo: string; // 7

    @IsNumber()
    cargo_id: number;

    @IsString()
    @Length(1, 10)
    codigo_ambiente: string; // 8

    @IsString()
    @Length(1, 10)
    codigo_grupo_contable: string; // 9

    @IsOptional()
    @IsString()
    @Length(1, 20)
    codigo_correlativo?: string; // 10 (puede generarse automático)

    // 🔹 Campo generado (no se recibe del cliente)
    @IsOptional()
    @IsString()
    codigo_completo?: string;

    // 🔹 Campos originales
    @IsNumber()
    responsable_id: number;

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

    @IsOptional()
    @IsString()
    archivo_respaldo_pdf?: string;

    @IsNumber()
    creado_por_id: number;

    @IsOptional()
    @IsNumber()
    actualizado_por_id?: number;

    @IsOptional()
    @IsEnum(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
