import { PartialType } from '@nestjs/mapped-types';
import { CreateNucleosDto } from './create-nucleos.dto';
export class UpdateNucleosDto extends PartialType(CreateNucleosDto) { }
