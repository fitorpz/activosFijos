import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISO_KEY } from '../decorators/tiene-permiso.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(PERMISO_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si la ruta no requiere permisos específicos, permitir acceso
        if (!permisosRequeridos || permisosRequeridos.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            console.error('❌ [PermisosGuard] Usuario no autenticado');
            throw new UnauthorizedException('Usuario no autenticado');
        }

        const permisosUsuario = user.rol?.permisos?.map((p) => p.nombre) || user.permisos || [];

        console.log('🧩 [PermisosGuard] Permisos del usuario:', permisosUsuario);
        console.log('🧩 [PermisosGuard] Permisos requeridos:', permisosRequeridos);

        const tienePermiso = permisosRequeridos.some((permiso) => permisosUsuario.includes(permiso));

        if (!tienePermiso) {
            console.warn('🚫 [PermisosGuard] Acceso denegado (sin permiso)');
            // 🔥 Aquí la clave: devolvemos 403 (no 401)
            throw new ForbiddenException('Acceso denegado: no tienes permisos suficientes.');
        }

        return true;
    }
}
