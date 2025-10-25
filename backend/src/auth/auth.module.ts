import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './jwt.constants'; // Asegúrate de tener este archivo

import { Usuario } from '../usuarios/entities/usuario.entity';
import { UserLogModule } from '../user-log/user-log.module';
import { PermisosGuard } from './guards/permisos.guard';

// ⚠️ Si NO usas UsuariosService dentro de AuthService, no importes UsuariosModule
// para evitar dependencias circulares innecesarias.
// import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      // ✅ Clave secreta fija (puedes moverla luego a .env)
      secret: jwtConstants.secret || 'clave-ultra-segura-2025',
      // 🔒 El token por defecto durará 2 horas
      signOptions: { expiresIn: '2h' },
    }),

    TypeOrmModule.forFeature([Usuario]),   // 👈 Necesario para @InjectRepository(Usuario)
    UserLogModule,                         // 👈 Necesario porque AuthController usa UserLogService
    // UsuariosModule, // solo si realmente necesitas UsuariosService aquí
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PermisosGuard],
  exports: [AuthService],
})
export class AuthModule { }
