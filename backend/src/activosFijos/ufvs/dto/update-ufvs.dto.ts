import { PartialType } from '@nestjs/mapped-types';
import { CreateUfvsDto } from './create-ufvs.dto';
export class UpdateUfvsDto extends PartialType(CreateUfvsDto) { }
