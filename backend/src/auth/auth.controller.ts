import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLogService } from '../user-log/user-log.service';
import type { Request } from 'express';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';


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
            const usuario = await this.authService.validarUsuario(
                body.correo,
                body.contrasena,
            );

            const tokenResult = await this.authService.login(usuario);

            // Registrar log de auditoría
            await this.userLogService.registrarLog(
                usuario.id,
                'Inicio de sesión exitoso',
                JSON.stringify({ correo: body.correo }),
                request.ip,
                request.headers['user-agent'],
            );

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

        } catch (error) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }
    }
    @UseGuards(JwtAuthGuard)
    @Get('mis-permisos')
    getMisPermisos(@Req() req: RequestWithUser) {
        const usuario = req.user;
        return usuario.rol?.permisos?.map((p) => p.nombre) || [];
    }
}
