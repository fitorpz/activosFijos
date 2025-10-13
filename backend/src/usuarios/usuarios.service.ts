import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { Rol } from './entities/rol.entity';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        @InjectRepository(Rol)
        private rolRepository: Repository<Rol>,
    ) { }

    async buscarPorCorreo(correo: string) {
        return this.usuarioRepository.findOne({
            where: { correo },
            relations: ['rol', 'rol.permisos', 'creadoPor'],
        });
    }

    async create(
        data: CreateUsuarioDto,
        creadorId?: number,
        yaHasheado = false,
    ): Promise<Usuario> {
        // ✅ Verificar si el correo ya existe (incluye usuarios soft-deleted)
        const existe = await this.usuarioRepository.findOne({
            where: { correo: data.correo },
            withDeleted: true, // incluye eliminados lógicamente
        });

        if (existe) {
            throw new BadRequestException(
                `El correo "${data.correo}" ya está registrado. Por favor, usa otro correo.`,
            );
        }

        // ✅ Buscar el rol
        const rol = await this.rolRepository.findOne({
            where: { id: data.rol_id },
        });
        if (!rol) {
            throw new BadRequestException('Rol no encontrado.');
        }

        // ✅ Hashear contraseña si no está hasheada
        const contrasenaFinal = yaHasheado
            ? data.contrasena
            : await bcrypt.hash(data.contrasena, 10);

        // ✅ Crear usuario
        const nuevoUsuario = this.usuarioRepository.create({
            correo: data.correo,
            contrasena: contrasenaFinal,
            rol: rol,
            rol_id: rol.id,
            nombre: data.nombre,
            creadoPorId: creadorId,
        });

        // ✅ Guardar en base de datos
        try {
            return await this.usuarioRepository.save(nuevoUsuario);
        } catch (error: any) {
            console.error('❌ Error al guardar usuario:', error);

            // Si es un error de clave duplicada (por seguridad adicional)
            if (error.code === '23505') {
                throw new BadRequestException(
                    `Ya existe un usuario con el correo "${data.correo}".`,
                );
            }

            throw new BadRequestException('Error al registrar el usuario.');
        }
    }

    async update(id: number, data: Partial<CreateUsuarioDto>): Promise<Usuario> {
        try {
            const usuario = await this.usuarioRepository.findOne({
                where: { id },
                relations: ['rol'],
            });
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            // Si se manda un nuevo rol_id, buscar y actualizar el rol
            if (data.rol_id) {
                const nuevoRol = await this.rolRepository.findOne({ where: { id: data.rol_id } });
                if (!nuevoRol) throw new Error('Rol no encontrado');
                usuario.rol = nuevoRol;
                usuario.rol_id = nuevoRol.id;
            }

            if (data.contrasena) {
                data.contrasena = await bcrypt.hash(data.contrasena, 10);
            }

            Object.assign(usuario, data);
            return await this.usuarioRepository.save(usuario);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw new Error('No se pudo actualizar el usuario');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        const resultado = await this.usuarioRepository.softDelete(id);
        if (resultado.affected === 0) {
            throw new Error('Usuario no encontrado');
        }
        return { message: 'Usuario eliminado correctamente' };
    }

    async findOne(id: number): Promise<Usuario | null> {
        return this.usuarioRepository.findOne({
            where: { id },
            relations: ['rol', 'rol.permisos', 'creadoPor'],
        });
    }

    async findAll(): Promise<Usuario[]> {
        return this.usuarioRepository.find({
            where: { deletedAt: IsNull() },
            relations: ['rol', 'rol.permisos', 'creadoPor'],
            order: { id: 'ASC' }
        });
    }

    async restaurar(id: number): Promise<{ message: string }> {
        const resultado = await this.usuarioRepository.restore(id);
        if (resultado.affected === 0) {
            throw new Error('El usuario no existe o ya está activo');
        }
        return { message: 'Usuario restaurado correctamente' };
    }
    async obtenerPermisosPorUsuario(idUsuario: number) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: idUsuario },
            relations: ['rol', 'rol.permisos'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        const permisos = usuario.rol?.permisos?.map((p) => p.nombre) || [];
        return permisos;
    }
}
