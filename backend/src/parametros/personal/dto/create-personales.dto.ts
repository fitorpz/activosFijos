import {
    IsString,
    IsOptional,
    IsNotEmpty,
    IsNumber,
    IsEmail,
    IsDateString,
} from 'class-validator';

export class CreatePersonalesDto {
    @IsNumber()
    @IsNotEmpty()
    documento: number;

    @IsString()
    @IsNotEmpty()
    expedido: string;

    @IsString()
    @IsNotEmpty()
    ci: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    profesion?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    celular?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsDateString()
    @IsOptional()
    fecnac?: string;

    @IsNumber()
    @IsOptional()
    estciv?: number;

    @IsNumber()
    @IsOptional()
    sexo?: number;
}
