import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class CreateAuxiliaresDto {
    @IsOptional()
    codigo?: string;

    @IsNotEmpty()
    descripcion: string;

    @IsNotEmpty()
    @IsIn(['ACTIVO', 'INACTIVO'], {
        message: 'El estado debe ser ACTIVO o INACTIVO',
    })
    estado: 'ACTIVO' | 'INACTIVO';

    @IsNotEmpty()
    codigo_grupo: string;
}
