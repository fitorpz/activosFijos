import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialEdificio } from './entities/historial-edificio.entity';
import { Repository } from 'typeorm';
import { Edificio } from '../../edificios/entities/edificio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class HistorialEdificioService {
    constructor(
        @InjectRepository(HistorialEdificio)
        private readonly historialRepo: Repository<HistorialEdificio>,
    ) { }

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

}
