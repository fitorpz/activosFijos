import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateCiudadesDto {
    @IsNotEmpty()
    codigo: string;

    @IsNotEmpty()
    descripcion: string;

    @IsOptional()
    @IsIn(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
