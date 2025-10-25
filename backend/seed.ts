// comando para ejecutar el seed: npx ts-node -r tsconfig-paths/register seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsuariosService } from './src/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Rol } from './src/usuarios/entities/rol.entity';
import { Permiso } from './src/usuarios/entities/permiso.entity'; // asegúrate de que la ruta sea correcta

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const usuarioService = app.get(UsuariosService);

    const rolRepo = dataSource.getRepository(Rol);
    const permisoRepo = dataSource.getRepository(Permiso);

    // ✅ Crear roles base
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

    // ✅ Crear o verificar roles base
    for (const rol of rolesBase) {
        let existente = await rolRepo.findOne({ where: { slug: rol.slug }, relations: ['permisos'] });

        if (!existente) {
            existente = rolRepo.create(rol);
            await rolRepo.save(existente);
            console.log(`✅ Rol creado: ${rol.nombre}`);
        } else {
            console.log(`ℹ️ Rol ya existe: ${rol.nombre}`);
        }

        // ✅ Asignar permisos al SUPERADMIN
        if (rol.slug === 'superadmin') {
            const permisos = await permisoRepo.find();
            existente.permisos = permisos;
            await rolRepo.save(existente);
            console.log(`🔐 Permisos asignados a SUPERADMIN: ${permisos.length}`);
        }

        // ✅ Asignar permisos limitados al ADMIN
        if (rol.slug === 'admin') {
            const permisosAdmin = await permisoRepo
                .createQueryBuilder('permiso')
                .where("permiso.nombre IN (:...nombres)", {
                    nombres: [
                        // Permisos principales del módulo de roles
                        'roles:listar',
                        'roles:editar',
                        // Permisos de gestión de usuarios
                        'usuarios:listar',
                        'usuarios:editar',
                        // Algunos permisos administrativos comunes
                        'grupos-contables:listar',
                        'auxiliares:listar',
                    ],
                })
                .getMany();

            existente.permisos = permisosAdmin;
            await rolRepo.save(existente);
            console.log(`🔐 Permisos limitados asignados a ADMIN: ${permisosAdmin.length}`);
        }

        // ✅ El rol USUARIO no tiene permisos al inicio
        if (rol.slug === 'usuario') {
            existente.permisos = [];
            await rolRepo.save(existente);
            console.log('🔐 Rol USUARIO creado sin permisos iniciales.');
        }
    }

    console.log('✅ Roles base verificados y permisos asignados.');

    // ✅ Crear usuario administrador inicial (solo si no existe)
    const correo = 'admin@ejemplo.com';
    const contrasena = 'password123'; // SIN hashear aquí
    const nombre = 'Administrador Inicial';

    const existe = await usuarioService.buscarPorCorreo(correo);
    if (existe) {
        console.log('❌ El usuario administrador ya existe.');
        await app.close();
        return;
    }

    await usuarioService.create(
        { correo, contrasena, nombre, rol_id: 1 }, // Asigna rol SUPERADMIN
        undefined, // creadorId
        false // ⚡ se hashea dentro del service
    );

    console.log('✅ Usuario administrador inicial creado exitosamente.');
    await app.close();
}

bootstrap();
