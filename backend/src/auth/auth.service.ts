import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        private jwtService: JwtService,
    ) { }

    // 🔹 Validar credenciales del usuario
    async validarUsuario(correo: string, contrasena: string): Promise<Usuario> {
        console.log('🔹 Credenciales recibidas:', { correo });

        // 🔸 Normalizar correo (minúsculas y sin espacios)
        const correoNormalizado = correo.trim().toLowerCase();

        // 🔸 Buscar usuario con relaciones (rol + permisos)
        const usuario = await this.usuarioRepository.findOne({
            where: { correo: correoNormalizado },
            relations: ['rol', 'rol.permisos'],
        });

        // 🔸 Usuario no encontrado
        if (!usuario) {
            console.log('❌ Usuario no encontrado');
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // 🔸 Verificar contraseña
        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isMatch) {
            console.log('❌ Contraseña incorrecta para:', usuario.correo);
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // 🔹 Verificar fecha de inicio (si existe)
        if (usuario.fecha_inicio && new Date() < new Date(usuario.fecha_inicio)) {
            console.log('⏳ Usuario aún no habilitado:', usuario.correo);
            throw new ForbiddenException(
                'Tu acceso aún no está habilitado. Comunícate con el administrador.',
            );
        }

        // 🔹 Verificar fecha de expiración (si existe)
        if (usuario.fecha_expiracion && new Date() > new Date(usuario.fecha_expiracion)) {
            console.log('⛔ Usuario expirado:', usuario.correo);
            throw new ForbiddenException('El acceso de este usuario ha expirado.');
        }

        console.log('✅ Usuario autenticado correctamente:', usuario.correo);
        return usuario;
    }

    // 🔹 Generar token JWT y devolver datos del usuario autenticado
    async login(usuario: Usuario): Promise<{ access_token: string; user: any }> {
        const rolCompleto = usuario.rol || null;
        const permisos = rolCompleto?.permisos?.map((p) => p.nombre) || [];

        // Payload del JWT
        const payload = {
            sub: usuario.id,
            correo: usuario.correo,
            rol: rolCompleto?.slug || rolCompleto?.nombre || 'sin-rol',
            permisos,
        };

        // 🔐 Calcular expiración del token dinámica
        let expiresIn = '1d'; // valor por defecto (24 horas)
        if (usuario.fecha_expiracion) {
            const diferenciaMs = new Date(usuario.fecha_expiracion).getTime() - Date.now();
            if (diferenciaMs <= 0) {
                // El usuario ya expiró
                throw new ForbiddenException('El acceso de este usuario ha expirado.');
            }
            // Convertir milisegundos a segundos y pasarlo al formato que acepta JWT
            expiresIn = `${Math.floor(diferenciaMs / 1000)}s`;
        }

        // 🔐 Generar token con expiración personalizada
        const token = this.jwtService.sign(payload, { expiresIn });

        // 🔸 Retornar estructura completa al frontend
        return {
            access_token: token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: rolCompleto,
                permisos,
                fecha_inicio: usuario.fecha_inicio,
                fecha_expiracion: usuario.fecha_expiracion,
            },
        };
    }
}
