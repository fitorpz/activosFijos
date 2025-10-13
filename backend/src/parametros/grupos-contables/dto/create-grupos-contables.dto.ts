import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateGruposContablesDto {
  @IsNotEmpty()
  codigo: string;

  @IsNotEmpty()
  descripcion: string;

  @IsNotEmpty()
  tiempo: number;

  @IsNotEmpty()
  porcentaje: number;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';
}
