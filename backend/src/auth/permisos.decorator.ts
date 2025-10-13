import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'permisos';
export const TienePermiso = (...permisos: string[]) =>
    SetMetadata(PERMISOS_KEY, permisos);
