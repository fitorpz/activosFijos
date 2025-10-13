import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadOrganizacionalDto } from './create-unidad-organizacional.dto';

export class UpdateUnidadOrganizacionalDto extends PartialType(CreateUnidadOrganizacionalDto) {
    actualizado_por_id?: number;
}
