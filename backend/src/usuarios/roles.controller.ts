import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ValidationPipe } from '@nestjs/common';


@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll() {
        const roles = await this.rolesService.findAll();
        return { data: roles }; 
    }


    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.rolesService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(
        @Body(new ValidationPipe()) createRolDto: CreateRolDto,
        @Req() req: Request
    ) {
        const usuarioId = req.user && (req.user as any).id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.rolesService.create(createRolDto, usuarioId, ip, userAgent);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(
        @Param('id') id: number,
        @Body(new ValidationPipe()) updateRolDto: UpdateRolDto,
        @Req() req: Request
    ) {
        const usuarioId = req.user && (req.user as any).id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.rolesService.update(+id, updateRolDto, usuarioId, ip, userAgent);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: number, @Req() req: Request) {
        const usuarioId = req.user && (req.user as any).id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.rolesService.remove(+id, usuarioId, ip, userAgent);
    }
}
