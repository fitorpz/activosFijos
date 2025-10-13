import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Put,
    Patch,
    Param,
    Delete,
    Req,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
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

    //  Crear usuario
    @Post()
    @TienePermiso('usuarios:crear')
    async create(@Body() createDto: CreateUsuarioDto, @Req() request: Request) {
        const user = request.user as any;
        if (!user || !user.id) {
            throw new BadRequestException('No se pudo obtener el usuario autenticado.');
        }

        const usuario = await this.usuariosService.create(createDto, user.id);

        await this.userLogService.registrarLog(
            usuario.id,
            'Registró un nuevo usuario',
            JSON.stringify(createDto),
            request.ip,
            request.headers['user-agent'],
        );

        return {
            message: ' Usuario registrado correctamente',
            usuario,
        };
    }

    //  Listar todos los usuarios
    @Get()
    @TienePermiso('usuarios:listar')
    findAll() {
        return this.usuariosService.findAll();
    }

    //  Obtener un usuario por ID
    @Get(':id')
    @TienePermiso('usuarios:listar')
    async findOne(@Param('id') id: number) {
        const usuario = await this.usuariosService.findOne(+id);
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    // 🟧 Actualizar usuario completo
    @Put(':id')
    @TienePermiso('usuarios:editar')
    update(@Param('id') id: string, @Body() data: Partial<CreateUsuarioDto>) {
        return this.usuariosService.update(Number(id), data);
    }

    // Actualizar parcialmente usuario
    @Patch(':id')
    @TienePermiso('usuarios:editar')
    patch(@Param('id') id: string, @Body() data: Partial<CreateUsuarioDto>) {
        return this.usuariosService.update(Number(id), data);
    }

    //  Eliminar usuario (borrado lógico)
    @Delete(':id')
    @TienePermiso('usuarios:eliminar')
    remove(@Param('id') id: number) {
        return this.usuariosService.remove(id);
    }

    //  Restaurar usuario eliminado
    @Patch('restaurar/:id')
    @TienePermiso('usuarios:editar')
    async restaurar(@Param('id') id: number) {
        await this.usuariosService.restaurar(id);
        return { message: 'Usuario restaurado correctamente' };
    }

    // 🔄 Obtener permisos actualizados (sin restricción de permisos)
    // Este endpoint debe poder usarse libremente por usuarios autenticados.
    @Get('permisos/actualizados')
    async obtenerPermisosActualizados(@Req() request: Request) {
        const user = request.user as any;
        if (!user || !user.id) {
            throw new BadRequestException('Usuario no autenticado.');
        }
        const permisos = await this.usuariosService.obtenerPermisosPorUsuario(user.id);
        return { permisos };
    }
}
