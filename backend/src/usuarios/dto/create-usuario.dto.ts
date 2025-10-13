import { RolUsuario } from '../enums/rol-usuario.enum';
import { IsEmail, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
    @IsEmail()
    correo: string;

    @IsString()
    contrasena: string;

    @IsOptional()
    nombre?: string;

    @IsNumber()
    rol_id: number;
}
