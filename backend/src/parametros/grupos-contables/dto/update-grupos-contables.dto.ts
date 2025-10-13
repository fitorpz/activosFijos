import { PartialType } from '@nestjs/mapped-types';
import { CreateGruposContablesDto } from './create-grupos-contables.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateGruposContablesDto extends PartialType(CreateGruposContablesDto) {
    @IsOptional()
    @IsIn(['ACTIVO', 'INACTIVO'])
    estado?: 'ACTIVO' | 'INACTIVO';
}
