import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateDistritosDto {
    @IsNotEmpty()
    codigo: string;

    @IsNotEmpty()
    descripcion: string;

    @IsOptional()
    @IsIn(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
