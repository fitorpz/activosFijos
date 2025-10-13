import { PartialType } from '@nestjs/mapped-types';
import { CreateAuxiliaresDto } from './create-auxiliares.dto';

export class UpdateAuxiliaresDto extends PartialType(CreateAuxiliaresDto) {
    // Aseguramos que el tipo también sea consistente aquí
    estado?: 'ACTIVO' | 'INACTIVO';
}
