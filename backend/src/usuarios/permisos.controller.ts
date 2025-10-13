// src/usuarios/permisos.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';

@Controller('permisos')
export class PermisosController {
    constructor(private readonly permisosService: PermisosService) { }

    @Get()
    findAll() {
        return this.permisosService.findAll();
    }

    @Post()
    create(@Body() createPermisoDto: CreatePermisoDto) {
        return this.permisosService.create(createPermisoDto);
    }
}
