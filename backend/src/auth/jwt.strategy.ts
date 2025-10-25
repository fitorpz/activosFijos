import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './jwt.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any): Promise<Usuario> {
        const usuario = await this.usuariosRepository.findOne({
            where: { id: payload.sub },
            relations: ['rol', 'rol.permisos'],
        });

        if (!usuario) {
            throw new UnauthorizedException('Token inválido o usuario inexistente');
        }

        // ✅ Adjuntamos permisos para el guard
        const permisos = usuario.rol?.permisos?.map((p) => p.nombre) || [];
        usuario['permisos'] = permisos;

        return usuario;
    }
}
