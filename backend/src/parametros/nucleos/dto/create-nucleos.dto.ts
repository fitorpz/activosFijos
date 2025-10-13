import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateNucleosDto {
    @IsNotEmpty()
    codigo: string;

    @IsNotEmpty()
    descripcion: string;

    @IsOptional()
    @IsIn(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}


