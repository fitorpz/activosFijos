import { PartialType } from '@nestjs/mapped-types';
import { CreateAmbienteDto } from './create-ambiente.dto';

export class UpdateAmbienteDto {
  readonly descripcion?: string;
  readonly codigo?: string;
  readonly unidad_organizacional_id?: number;
}
