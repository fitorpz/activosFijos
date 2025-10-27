import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { AmpliacionesService } from './ampliaciones.service';
import { CreateAmpliacionDto } from '../dto/create-ampliacion.dto';
import { UpdateAmpliacionDto } from '../dto/update-ampliacion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('edificios/ampliaciones')
@UseGuards(JwtAuthGuard)
export class AmpliacionesController {
    constructor(private readonly ampliacionesService: AmpliacionesService) { }

    @Post()
    async create(@Body() dto: CreateAmpliacionDto, @Request() req) {
        const usuarioId = req.user?.id;
        return this.ampliacionesService.create(dto, usuarioId);
    }

    @Get()
    async findAll() {
        return this.ampliacionesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ampliacionesService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAmpliacionDto,
        @Request() req,
    ) {
        const usuarioId = req.user?.id;
        return this.ampliacionesService.update(id, dto, usuarioId);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const usuarioId = req.user?.id;
        return this.ampliacionesService.remove(id, usuarioId);
    }
}
