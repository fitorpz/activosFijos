import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { RemodelacionesService } from './remodelaciones.service';
import { CreateRemodelacionDto } from '../dto/create-remodelacion.dto';
import { UpdateRemodelacionDto } from '../dto/update-remodelacion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('edificios/remodelaciones')
@UseGuards(JwtAuthGuard)
export class RemodelacionesController {
    constructor(private readonly remodelacionesService: RemodelacionesService) { }

    // 🔹 Crear remodelación
    @Post()
    async create(@Body() dto: CreateRemodelacionDto, @Request() req) {
        const usuarioId = req.user?.id;
        return this.remodelacionesService.create(dto, usuarioId);
    }

    // 🔹 Listar remodelaciones
    @Get()
    async findAll() {
        return this.remodelacionesService.findAll();
    }

    // 🔹 Obtener una remodelación específica
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.remodelacionesService.findOne(id);
    }

    // 🔹 Actualizar remodelación
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRemodelacionDto,
        @Request() req,
    ) {
        const usuarioId = req.user?.id;
        return this.remodelacionesService.update(id, dto, usuarioId);
    }

    // 🔹 Eliminar remodelación
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const usuarioId = req.user?.id;
        return this.remodelacionesService.remove(id, usuarioId);
    }
}
