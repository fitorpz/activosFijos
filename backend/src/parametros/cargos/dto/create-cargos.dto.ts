import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCargosDto {


    @IsNotEmpty()
    area: string;

    @IsNotEmpty()
    unidad_organizacional: string;

    @IsNotEmpty()
    estado: string;

    @IsNotEmpty()
    ambiente: string;

    @IsNotEmpty()
    codigo: string;

    @IsNotEmpty()
    cargo: string;

    @IsNotEmpty()
    personal1: string;

    @IsNotEmpty()
    personal2: string;

    @IsNotEmpty()
    personal3: string;

    @IsNotEmpty()
    @IsNumber()
    ambiente_id: number;
}
