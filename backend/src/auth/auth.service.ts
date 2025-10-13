import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        console.log(' Credenciales recibidas:', { correo, contrasena });

        // 🔸 Incluimos las relaciones del rol y sus permisos
        const usuario = await this.usuarioRepository.findOne({
            where: { correo },
            relations: ['rol', 'rol.permisos'],
        });

        if (!usuario) {
            console.log(' Usuario no encontrado');
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isMatch) {
            console.log(' Contraseña incorrecta');
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        console.log(' Usuario autenticado');
        return usuario;
    }

    // 🔹 Generar token JWT y devolver datos del usuario autenticado
    async login(usuario: Usuario): Promise<{ access_token: string; user: any }> {
        // Aseguramos que el rol y los permisos estén presentes
        const rolCompleto = usuario.rol || null;
        const permisos = rolCompleto?.permisos?.map((p) => p.nombre) || [];

        // Payload del token JWT
        const payload = {
            sub: usuario.id,
            correo: usuario.correo,
            rol: rolCompleto?.slug || rolCompleto?.nombre || 'sin-rol',
            permisos,
        };

        // Firmar el token
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: rolCompleto,
                permisos,
            },
        };
    }
}
