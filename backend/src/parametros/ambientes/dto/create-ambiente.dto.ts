import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAmbienteDto {
    @IsNotEmpty()
    @IsString()
    descripcion: string;

    @IsNotEmpty()
    @IsNumber()
    unidad_organizacional_id: number;
}
