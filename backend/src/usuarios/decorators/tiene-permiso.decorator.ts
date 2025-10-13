import { SetMetadata } from '@nestjs/common';

export const PERMISO_KEY = 'permisos';
export const TienePermiso = (...permisos: string[]) =>
  SetMetadata(PERMISO_KEY, permisos);
