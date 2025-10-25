import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Rol } from './entities/rol.entity';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,
    ) { }

    async create(
        data: CreateUsuarioDto,
        creadoPorId?: number,
        contrasenaYaHasheada = false,
    ): Promise<Usuario> {
        const existe = await this.usuarioRepository.findOne({
            where: { correo: data.correo },
            withDeleted: true,
        });

        if (existe) {
            throw new BadRequestException(`El correo "${data.correo}" ya está registrado.`);
        }

        const rol = await this.rolRepository.findOne({ where: { id: data.rol_id } });
        if (!rol) throw new BadRequestException('Rol no encontrado.');

        const contrasenaHasheada = await bcrypt.hash(data.contrasena, 10);

        const nuevoUsuario = this.usuarioRepository.create({
            correo: data.correo,
            contrasena: contrasenaHasheada,
            rol,
            rol_id: rol.id,
            nombre: data.nombre,
            creadoPorId: creadoPorId ?? null,
            fecha_inicio: data.fecha_inicio ?? null,
            fecha_expiracion: data.fecha_expiracion ?? null,
        } as DeepPartial<Usuario>);

        return await this.usuarioRepository.save(nuevoUsuario);
    }

    async update(id: number, data: UpdateUsuarioDto, modificadoPorId?: number): Promise<Usuario> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id },
            relations: ['rol'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Asignar modificador
        usuario.modificadoPorId = modificadoPorId || null;


        // Actualizar rol si corresponde
        if (data.rol_id) {
            const nuevoRol = await this.rolRepository.findOne({ where: { id: data.rol_id } });
            if (!nuevoRol) throw new NotFoundException('Rol no encontrado');
            usuario.rol = nuevoRol;
            usuario.rol_id = nuevoRol.id;
        }

        if (data.contrasena) {
            data.contrasena = await bcrypt.hash(data.contrasena, 10);
        }

        usuario.fecha_inicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null;
        usuario.fecha_expiracion = data.fecha_expiracion ? new Date(data.fecha_expiracion) : null;


        Object.assign(usuario, data);
        return await this.usuarioRepository.save(usuario);
    }

    async findAll(): Promise<Usuario[]> {
        return await this.usuarioRepository.find({
            relations: ['rol', 'creadoPor', 'modificadoPor'],
            order: { id: 'ASC' },
            withDeleted: true,
        });
    }

    async findOne(id: number): Promise<Usuario | null> {
        return await this.usuarioRepository.findOne({
            where: { id },
            relations: ['rol', 'creadoPor', 'modificadoPor'],
            withDeleted: true,
        });
    }

    // 🔹 Devuelve usuarios que no están asignados a ningún personal.
    // Si se proporciona un idPersonal, también incluirá al usuario asignado a ese personal.
    async findUsuariosDisponibles(idPersonal?: number): Promise<Usuario[]> {
        const query = this.usuarioRepository
            .createQueryBuilder('usuario')
            .leftJoin('usuario.personal', 'personal')
            .where('usuario.estado = :estado', { estado: 'ACTIVO' });

        if (idPersonal) {
            // Incluir usuario asignado al personal actual o los que no tienen personal
            query.andWhere('(personal.id IS NULL OR personal.id = :idPersonal)', { idPersonal });
        } else {
            // Solo los usuarios libres (sin personal asociado)
            query.andWhere('personal.id IS NULL');
        }

        return await query.getMany();
    }


    async remove(id: number): Promise<{ message: string }> {
        await this.usuarioRepository.softDelete(id);
        return { message: 'Usuario eliminado correctamente' };
    }

    async restaurar(id: number): Promise<void> {
        await this.usuarioRepository.restore(id);
    }

    async obtenerPermisosPorUsuario(id: number): Promise<string[]> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id },
            relations: ['rol', 'rol.permisos'],
        });

        if (!usuario || !usuario.rol) return [];
        return usuario.rol.permisos.map((permiso) => permiso.nombre);
    }

    async buscarPorCorreo(correo: string): Promise<Usuario | null> {
        return await this.usuarioRepository.findOne({
            where: { correo },
            relations: ['rol', 'rol.permisos'],
            withDeleted: true,
        });
    }

}
