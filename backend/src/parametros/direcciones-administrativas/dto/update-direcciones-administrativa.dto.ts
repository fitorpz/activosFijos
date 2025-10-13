import { PartialType } from '@nestjs/mapped-types';
import { CreateDireccionesAdministrativasDto } from './create-direcciones-administrativa.dto';

export class UpdateDireccionesAdministrativasDto extends PartialType(CreateDireccionesAdministrativasDto) {}
