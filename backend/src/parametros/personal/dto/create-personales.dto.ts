import { IsNotEmpty } from 'class-validator';

export class CreatePersonalesDto {

    @IsNotEmpty()
    documento: number;

    @IsNotEmpty()
    ci: string;

    @IsNotEmpty()
    nombre: string;

    @IsNotEmpty()
    usuario_id?: number;

    @IsNotEmpty()
    estado: string;

    @IsNotEmpty()
    expedido: string;

    @IsNotEmpty()
    profesion: string;

    @IsNotEmpty()
    direccion: string;

    @IsNotEmpty()
    celular: string;

    @IsNotEmpty()
    telefono: string;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    fecnac: string;

    @IsNotEmpty()
    estciv: number;

    @IsNotEmpty()
    sexo: number;

}
