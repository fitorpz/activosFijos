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

    async registrarAccion(
        edificio: Edificio,
        usuario: Usuario,
        accion: string,
    ): Promise<HistorialEdificio> {
        const historial = this.historialRepo.create({
            edificio,
            usuario,
            accion,
        });

        return this.historialRepo.save(historial);
    }
}
