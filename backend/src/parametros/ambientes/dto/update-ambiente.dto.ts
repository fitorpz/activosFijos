import { PartialType } from '@nestjs/mapped-types';
import { CreateAmbienteDto } from './create-ambiente.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateAmbienteDto extends PartialType(CreateAmbienteDto) {
  @IsOptional()
  @IsString()
  codigo?: string;
}
