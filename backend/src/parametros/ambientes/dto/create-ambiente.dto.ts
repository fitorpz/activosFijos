import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAmbienteDto {
    @IsNotEmpty()
    @IsString()
    descripcion: string;

    @IsNotEmpty()
    @IsNumber()
    unidad_organizacional_id: number;

    @IsNotEmpty()
    @IsNumber()
    creado_por_id: number;

}
