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
import { AmpliacionesService } from './ampliaciones.service';
import { CreateAmpliacionDto } from '../dto/create-ampliacion.dto';
import { UpdateAmpliacionDto } from '../dto/update-ampliacion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('activos-fijos/edificios/ampliaciones')
@UseGuards(JwtAuthGuard)
export class AmpliacionesController {
    constructor(private readonly ampliacionesService: AmpliacionesService) { }

    // 🔹 Crear nueva ampliación
    @Post()
    async create(@Body() dto: CreateAmpliacionDto, @Request() req) {
        const usuarioId = req.user?.id;
        return this.ampliacionesService.create(dto, usuarioId);
    }

    // 🔹 Listar ampliaciones (todas o por edificio)
    @Get()
    async findAll(@Query('edificioId') edificioId?: number) {
        if (edificioId) {
            return this.ampliacionesService.findByEdificio(edificioId);
        }
        return this.ampliacionesService.findAll();
    }

    // 🔹 Obtener una ampliación específica
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ampliacionesService.findOne(id);
    }

    // 🔹 Actualizar ampliación
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAmpliacionDto,
        @Request() req,
    ) {
        const usuarioId = req.user?.id;
        return this.ampliacionesService.update(id, dto, usuarioId);
    }

    // 🔹 Eliminar ampliación
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const usuarioId = req.user?.id;
        return this.ampliacionesService.remove(id, usuarioId);
    }
}
