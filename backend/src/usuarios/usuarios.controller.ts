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

    @Get()
    @TienePermiso('usuarios:listar')
    findAll() {
        return this.usuariosService.findAll();
    }

    @Get(':id')
    @TienePermiso('usuarios:listar')
    async findOne(@Param('id') id: number) {
        const usuario = await this.usuariosService.findOne(id);
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    @Put(':id')
    @TienePermiso('usuarios:editar')
    async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
        const user = req.user as any;
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

    @Patch(':id')
    @TienePermiso('usuarios:editar')
    async patch(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
        const user = req.user as any;
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

    @Delete(':id')
    @TienePermiso('usuarios:eliminar')
    remove(@Param('id') id: number) {
        return this.usuariosService.remove(id);
    }

    @Patch('restaurar/:id')
    @TienePermiso('usuarios:editar')
    async restaurar(@Param('id') id: number) {
        await this.usuariosService.restaurar(id);
        return { message: 'Usuario restaurado correctamente' };
    }

    @Get('permisos/actualizados')
    async obtenerPermisosActualizados(@Req() req: Request) {
        const user = req.user as any;
        if (!user?.id) throw new BadRequestException('Usuario no autenticado.');

        const permisos = await this.usuariosService.obtenerPermisosPorUsuario(user.id);
        return { permisos };
    }
}
