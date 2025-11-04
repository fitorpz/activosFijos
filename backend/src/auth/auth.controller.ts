import {
    Controller,
    Post,
    Body,
    Req,
    UnauthorizedException,
    ForbiddenException,
    InternalServerErrorException,
    UseGuards,
    Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLogService } from '../user-log/user-log.service';
import type { Request } from 'express';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userLogService: UserLogService,
    ) { }

    @Post('login')
    async login(
        @Body() body: LoginUsuarioDto,
        @Req() request: Request,
    ) {
        try {
            //  Validar credenciales y obtener usuario
            const usuario = await this.authService.validarUsuario(
                body.correo,
                body.contrasena,
            );

            //  Generar token
            const tokenResult = await this.authService.login(usuario);

            //  Registrar log de inicio de sesión
            await this.userLogService.registrarLog(
                usuario.id,
                'Inicio de sesión exitoso',
                JSON.stringify({ correo: body.correo }),
                request.ip,
                request.headers['user-agent'],
            );

            //  Respuesta al frontend
            return {
                message: 'Login exitoso',
                access_token: tokenResult.access_token,
                usuario: {
                    id: usuario.id,
                    correo: usuario.correo,
                    rol: usuario.rol,
                    nombre: usuario.nombre,
                },
            };

        } catch (error: any) {
            console.error(' Error en login:', error.message);

            //  Responder según el tipo de error recibido del AuthService
            if (error instanceof ForbiddenException) {
                // Usuario expirado o no habilitado
                throw new ForbiddenException(error.message);
            }

            if (error instanceof UnauthorizedException) {
                // Credenciales incorrectas
                throw new UnauthorizedException(error.message);
            }

            // Cualquier otro error inesperado
            throw new InternalServerErrorException('Error interno en autenticación');
        }
    }

    //  Endpoint protegido: obtener permisos del usuario autenticado
    @UseGuards(JwtAuthGuard)
    @Get('mis-permisos')
    getMisPermisos(@Req() req: RequestWithUser) {
        const usuario = req.user;
        return usuario.rol?.permisos?.map((p) => p.nombre) || [];
    }
}
