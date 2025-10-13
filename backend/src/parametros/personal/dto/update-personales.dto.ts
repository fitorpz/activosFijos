import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonalesDto } from './create-personales.dto';

export class UpdatePersonalesDto extends PartialType(CreatePersonalesDto) { }
