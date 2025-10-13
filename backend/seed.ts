//comando para ejecutar el seed: npx ts-node -r tsconfig-paths/register seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsuariosService } from './src/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Rol } from './src/usuarios/entities/rol.entity'; // ajusta la ruta si es distinta

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const usuarioService = app.get(UsuariosService);

    const rolRepo = dataSource.getRepository(Rol);

    // ✅ Crear roles base si no existen
    const rolesBase = [
        {
            id: 1,
            nombre: 'SUPERADMIN',
            slug: 'superadmin',
            descripcion: 'Rol con acceso total al sistema',
        },
        {
            id: 2,
            nombre: 'ADMIN',
            slug: 'admin',
            descripcion: 'Rol administrativo con permisos limitados',
        },
        {
            id: 3,
            nombre: 'USUARIO',
            slug: 'usuario',
            descripcion: 'Rol básico de usuario del sistema',
        },
    ];

    for (const rol of rolesBase) {
        const existe = await rolRepo.findOne({ where: { slug: rol.slug } });
        if (!existe) {
            await rolRepo.save(rol);
            console.log(`✅ Rol creado: ${rol.nombre}`);
        } else {
            console.log(`ℹ️ Rol ya existe: ${rol.nombre}`);
        }
    }

    console.log('✅ Roles base verificados.');

    // ✅ Crear usuario administrador inicial
    const correo = 'admin@ejemplo.com';
    const contrasenaPlano = 'password123';
    const contrasena = await bcrypt.hash(contrasenaPlano, 10);
    const nombre = 'Administrador Inicial';

    const existe = await usuarioService.buscarPorCorreo(correo);
    if (existe) {
        console.log('❌ El usuario ya existe.');
        await app.close();
        return;
    }

    await usuarioService.create(
        { correo, contrasena, nombre, rol_id: 1 },
        undefined, // creadorId
        true // yaHasheado = true
    );

    console.log('✅ Usuario administrador creado exitosamente.');
    await app.close();
}

bootstrap();
