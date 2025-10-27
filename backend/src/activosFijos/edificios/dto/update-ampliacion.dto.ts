import { PartialType } from '@nestjs/mapped-types';
import { CreateAmpliacionDto } from './create-ampliacion.dto';

export class UpdateAmpliacionDto extends PartialType(CreateAmpliacionDto) { }
