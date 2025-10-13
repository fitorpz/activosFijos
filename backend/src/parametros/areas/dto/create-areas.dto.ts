import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreateAreasDto {
  @IsString()
  codigo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';
}
