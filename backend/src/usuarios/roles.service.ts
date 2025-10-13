import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { Repository } from 'typeorm';
import { AuditoriaRolesPermisosService } from 'src/auditoria/auditoria-roles-permisos.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,
        @InjectRepository(Permiso)
        private readonly permisoRepository: Repository<Permiso>,
        private readonly auditoriaService: AuditoriaRolesPermisosService,
    ) { }

    async findAll() {
        return await this.rolRepository.find({ relations: ['permisos'] });
    }

    async findOne(id: number) {
        const rol = await this.rolRepository.findOne({ where: { id }, relations: ['permisos'] });
        if (!rol) throw new NotFoundException('Rol no encontrado');
        return rol;
    }

    async create(data: CreateRolDto, usuarioId?: number, ip?: string, userAgent?: string) {
        // Verificar unicidad del slug y nombre
        const existeSlug = await this.rolRepository.findOne({ where: { slug: data.slug } });
        if (existeSlug) {
            throw new BadRequestException('Ya existe un rol con ese slug');
        }
        const existeNombre = await this.rolRepository.findOne({ where: { nombre: data.nombre } });
        if (existeNombre) {
            throw new BadRequestException('Ya existe un rol con ese nombre');
        }

        // Permisos
        let permisos: Permiso[] = [];
        if (data.permisos && data.permisos.length > 0) {
            permisos = await this.permisoRepository.findByIds(data.permisos);
        }

        const rol = this.rolRepository.create({
            nombre: data.nombre,
            slug: data.slug,
            descripcion: data.descripcion,
            permisos,
        });
        const nuevoRol = await this.rolRepository.save(rol);

        // Auditoría de creación
        if (usuarioId) {
            const equipo = userAgent ? userAgent.split(')')[0].replace('Mozilla/5.0 (', '') : '';
            await this.auditoriaService.registrarCambio({
                usuario_id: usuarioId,
                accion: 'CREAR_ROL',
                detalle: `Creó el rol ${nuevoRol.nombre} (${nuevoRol.id})`,
                rol_afectado_id: nuevoRol.id,
                datos_antes: null,
                datos_despues: nuevoRol,
                ip,
                user_agent: userAgent,
                equipo,
            });
        }

        return nuevoRol;
    }

    async update(id: number, data: UpdateRolDto, usuarioId: number, ip?: string, userAgent?: string) {
        const rolAntes = await this.rolRepository.findOne({ where: { id }, relations: ['permisos'] });
        if (!rolAntes) throw new NotFoundException('Rol no encontrado');

        // Si cambia el slug, verificar que no exista otro igual
        if (data.slug && data.slug !== rolAntes.slug) {
            const existeSlug = await this.rolRepository.findOne({ where: { slug: data.slug } });
            if (existeSlug) {
                throw new BadRequestException('Ya existe un rol con ese slug');
            }
        }
        // Si cambia el nombre, verificar que no exista otro igual
        if (data.nombre && data.nombre !== rolAntes.nombre) {
            const existeNombre = await this.rolRepository.findOne({ where: { nombre: data.nombre } });
            if (existeNombre) {
                throw new BadRequestException('Ya existe un rol con ese nombre');
            }
        }

        // Actualiza permisos si se envían
        if (data.permisos) {
            rolAntes.permisos = await this.permisoRepository.findByIds(data.permisos);
        }
        // Actualiza otros campos si se envían
        rolAntes.nombre = data.nombre ?? rolAntes.nombre;
        rolAntes.slug = data.slug ?? rolAntes.slug;
        rolAntes.descripcion = data.descripcion ?? rolAntes.descripcion;

        const rolDespues = await this.rolRepository.save(rolAntes);

        // Auditoría de edición
        const equipo = userAgent ? userAgent.split(')')[0].replace('Mozilla/5.0 (', '') : '';
        await this.auditoriaService.registrarCambio({
            usuario_id: usuarioId,
            accion: 'ACTUALIZAR_ROL',
            detalle: `Actualizó el rol ${id}`,
            rol_afectado_id: id,
            datos_antes: rolAntes,
            datos_despues: rolDespues,
            ip,
            user_agent: userAgent,
            equipo,
        });

        return rolDespues;
    }

    async remove(id: number, usuarioId?: number, ip?: string, userAgent?: string) {
        const rolAntes = await this.rolRepository.findOne({ where: { id }, relations: ['permisos'] });
        if (!rolAntes) throw new NotFoundException('Rol no encontrado');
        const result = await this.rolRepository.delete(id);

        // Auditoría de eliminación
        if (usuarioId) {
            const equipo = userAgent ? userAgent.split(')')[0].replace('Mozilla/5.0 (', '') : '';
            await this.auditoriaService.registrarCambio({
                usuario_id: usuarioId,
                accion: 'ELIMINAR_ROL',
                detalle: `Eliminó el rol ${id}`,
                rol_afectado_id: id,
                datos_antes: rolAntes,
                datos_despues: null,
                ip,
                user_agent: userAgent,
                equipo,
            });
        }

        return result;
    }
}
