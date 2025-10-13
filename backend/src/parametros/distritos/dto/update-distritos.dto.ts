import { PartialType } from '@nestjs/mapped-types';
import { CreateDistritosDto } from './create-distritos.dto';
export class UpdateDistritosDto extends PartialType(CreateDistritosDto) { }
