import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUfvsDto {
    @IsNotEmpty()
    fecha: Date;

    @IsNotEmpty()
    tc: number;

    @IsOptional()
    @IsIn(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
