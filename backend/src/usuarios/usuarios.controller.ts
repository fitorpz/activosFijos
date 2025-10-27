import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    Patch,
    Delete,
    Req,
    UseGuards,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UserLogService } from '../user-log/user-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { TienePermiso } from '../auth/permisos.decorator';
import type { Request } from 'express';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly userLogService: UserLogService,
    ) { }

    // 🔹 Crear usuario
    @Post()
    @TienePermiso('usuarios:crear')
    async create(@Body() dto: CreateUsuarioDto, @Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        const usuario = await this.usuariosService.create(dto, user.id);

        await this.userLogService.registrarLog(
            usuario.id,
            'Creó un nuevo usuario',
            JSON.stringify(dto),
            req.ip,
            req.headers['user-agent'],
        );

        return { message: 'Usuario creado correctamente', usuario };
    }

    // 🔹 Listar todos los usuarios
    @Get()
    @TienePermiso('usuarios:listar')
    findAll() {
        return this.usuariosService.findAll();
    }

    @Get('disponibles')
    async findDisponibles() {
        return this.usuariosService.findUsuariosDisponibles();
    }

    // 🔹 Obtener un usuario por ID
    @Get(':id')
    @TienePermiso('usuarios:listar')
    async findOne(@Param('id') id: number) {
        const usuario = await this.usuariosService.findOne(id);
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    // 🔹 Obtener usuarios disponibles incluyendo el usuario asignado a un personal específico
    @Get('disponibles/:idPersonal')
    async findDisponiblesIncluyendo(@Param('idPersonal') idPersonal: string) {
        return this.usuariosService.findUsuariosDisponibles(+idPersonal);
    }


    // 🔹 Actualizar usuario (PUT)
    @Put(':id')
    @TienePermiso('usuarios:editar')
    async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        const usuario = await this.usuariosService.update(+id, dto, user.id);

        await this.userLogService.registrarLog(
            +id,
            'Actualizó usuario (PUT)',
            JSON.stringify(dto),
            req.ip,
            req.headers['user-agent'],
        );

        return { message: 'Usuario actualizado correctamente', usuario };
    }

    // 🔹 Actualizar parcialmente usuario (PATCH)
    @Patch(':id')
    @TienePermiso('usuarios:editar')
    async patch(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        const usuario = await this.usuariosService.update(+id, dto, user.id);

        await this.userLogService.registrarLog(
            +id,
            'Actualizó usuario (PATCH)',
            JSON.stringify(dto),
            req.ip,
            req.headers['user-agent'],
        );

        return { message: 'Usuario parcialmente actualizado', usuario };
    }

    // 🔹 Eliminar usuario
    @Delete(':id')
    @TienePermiso('usuarios:eliminar')
    async remove(@Param('id') id: number, @Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        const result = await this.usuariosService.remove(id);

        await this.userLogService.registrarLog(
            user.id,
            'Eliminó un usuario',
            JSON.stringify({ id }),
            req.ip,
            req.headers['user-agent'],
        );

        return { message: 'Usuario eliminado correctamente', result };
    }

    // 🔹 Restaurar usuario eliminado
    @Patch('restaurar/:id')
    @TienePermiso('usuarios:editar')
    async restaurar(@Param('id') id: number, @Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        await this.usuariosService.restaurar(id);

        await this.userLogService.registrarLog(
            user.id,
            'Restauró un usuario',
            JSON.stringify({ id }),
            req.ip,
            req.headers['user-agent'],
        );

        return { message: 'Usuario restaurado correctamente' };
    }

    // 🔹 Obtener permisos actualizados
    @Get('permisos/actualizados')
    async obtenerPermisosActualizados(@Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        const permisos = await this.usuariosService.obtenerPermisosPorUsuario(user.id);
        return { permisos };
    }
}
