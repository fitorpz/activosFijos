// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { jwtConstants } from './jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // ✅ El JWT expirará automáticamente
            secretOrKey: jwtConstants.secret || 'clave-ultra-segura-2025',
        });
    }

    async validate(payload: any): Promise<Usuario> {
        // 🔹 Buscar usuario por ID del payload
        const usuario = await this.usuarioRepository.findOne({
            where: { id: payload.sub },
            relations: ['rol', 'rol.permisos'],
        });

        if (!usuario) {
            throw new UnauthorizedException('Token inválido o usuario inexistente.');
        }

        // ⛔ VALIDAR SI ESTÁ EXPIRADO
        if (usuario.fecha_expiracion && new Date() > new Date(usuario.fecha_expiracion)) {
            console.log('⛔ Usuario expirado detectado en JwtStrategy:', usuario.correo);
            throw new ForbiddenException('El acceso de este usuario ha expirado.');
        }

        // ⏳ VALIDAR SI AÚN NO ESTÁ HABILITADO
        if (usuario.fecha_inicio && new Date() < new Date(usuario.fecha_inicio)) {
            console.log('⏳ Usuario aún no habilitado:', usuario.correo);
            throw new ForbiddenException('Tu acceso aún no está habilitado.');
        }

        // 🔹 Agregar permisos al usuario (opcional)
        const permisos = usuario.rol?.permisos?.map((p) => p.nombre) || [];
        (usuario as any).permisos = permisos;

        console.log('🟢 Validación JWT exitosa para:', usuario.correo);
        return usuario;
    }
}
