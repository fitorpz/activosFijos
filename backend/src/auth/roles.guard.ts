import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndMerge<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // si no hay roles definidos, permitir acceso
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // esto viene del token JWT (jwt.strategy.ts)

        return requiredRoles.includes(user.rol);
    }
}
