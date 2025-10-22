import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsDateString,
    IsNumber,
} from 'class-validator';

export class CreateUsuarioDto {
    @IsEmail({}, { message: 'El correo debe tener un formato válido' })
    correo: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @IsString({ message: 'La contraseña debe ser un texto' })
    contrasena: string;

    @IsOptional()
    @IsString({ message: 'El nombre debe ser un texto' })
    nombre?: string;

    @IsNotEmpty({ message: 'El rol es obligatorio' })
    @IsNumber({}, { message: 'El rol debe ser un número' })
    rol_id: number;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de inicio debe tener formato válido (YYYY-MM-DD)' })
    fecha_inicio?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de expiración debe tener formato válido (YYYY-MM-DD)' })
    fecha_expiracion?: string;
}
