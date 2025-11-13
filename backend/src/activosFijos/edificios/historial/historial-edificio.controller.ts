import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HistorialEdificioService } from './historial-edificio.service';

@Controller('activos-fijos/historial-edificios')
@UseGuards(JwtAuthGuard)
export class HistorialEdificioController {

    constructor(private readonly historialService: HistorialEdificioService) { }

    // 🔹 Obtener historial por edificio
    @Get(':edificioId')
    async obtenerHistorial(
        @Param('edificioId', ParseIntPipe) edificioId: number
    ) {
        return this.historialService.obtenerPorEdificio(edificioId);
    }
}
