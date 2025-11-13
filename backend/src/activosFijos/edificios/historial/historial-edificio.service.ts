import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialEdificio } from './entities/historial-edificio.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistorialEdificioService {
    constructor(
        @InjectRepository(HistorialEdificio)
        private readonly historialRepo: Repository<HistorialEdificio>,
    ) { }

    // 🔹 Registrar acción en el historial
    async registrarAccion(data: {
        edificioId: number;
        usuarioId: number;
        accion: string;
        descripcion?: string;
    }): Promise<HistorialEdificio> {
        const { edificioId, usuarioId, accion, descripcion } = data;

        const historial = this.historialRepo.create({
            edificio: { id: edificioId } as any,
            usuario: { id: usuarioId } as any,
            accion,
            descripcion,
            fecha_accion: new Date(),
        });

        return await this.historialRepo.save(historial);
    }

    // 🔹 Obtener historial por edificio
    async obtenerPorEdificio(edificioId: number) {
        const resultado = await this.historialRepo.find({
            where: {
                edificio: { id: edificioId }
            },
            order: { fecha_accion: 'DESC' }
        });

        return { data: resultado };
    }
}
