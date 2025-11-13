import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { BajasService } from './bajas.service';
import { CreateBajaDto } from '../dto/create-baja.dto';
import { UpdateBajaDto } from '../dto/update-baja.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('activos-fijos/edificios/bajas')
@UseGuards(JwtAuthGuard)
export class BajasController {
    constructor(private readonly bajasService: BajasService) { }

    // 🔹 Crear nueva baja
    @Post()
    async create(@Body() dto: CreateBajaDto, @Request() req) {
        const usuarioId = req.user?.id;
        return this.bajasService.create(dto, usuarioId);
    }

    // 🔹 Listar bajas (todas o por edificio)
    @Get()
    async findAll(@Query('edificioId') edificioId?: number) {
        if (edificioId) {
            return this.bajasService.findByEdificio(edificioId);
        }
        return this.bajasService.findAll();
    }

    // 🔹 Obtener baja específica
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bajasService.findOne(id);
    }

    // 🔹 Actualizar baja
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBajaDto,
        @Request() req,
    ) {
        const usuarioId = req.user?.id;
        return this.bajasService.update(id, dto, usuarioId);
    }

    // 🔹 Eliminar baja
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const usuarioId = req.user?.id;
        return this.bajasService.remove(id, usuarioId);
    }
}
