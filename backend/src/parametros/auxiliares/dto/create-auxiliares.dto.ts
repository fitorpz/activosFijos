import { IsNotEmpty, IsIn } from 'class-validator';

export class CreateAuxiliaresDto {
    @IsNotEmpty()
    codigo: string;

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
