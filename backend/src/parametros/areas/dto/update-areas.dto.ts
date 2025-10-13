import { PartialType } from '@nestjs/mapped-types';
import { CreateAreasDto } from './create-areas.dto';
export class UpdateAreasDto extends PartialType(CreateAreasDto) { }

