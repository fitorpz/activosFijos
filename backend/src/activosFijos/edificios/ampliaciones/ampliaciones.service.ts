import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdificioAmpliacion } from '../entities/edificio-ampliacion.entity';
import { CreateAmpliacionDto } from '../dto/create-ampliacion.dto';
import { UpdateAmpliacionDto } from '../dto/update-ampliacion.dto';
import { Edificio } from '../entities/edificio.entity';
import { HistorialEdificioService } from '../historial/historial-edificio.service';

@Injectable()
export class AmpliacionesService {
    constructor(
        @InjectRepository(EdificioAmpliacion)
        private readonly ampliacionesRepo: Repository<EdificioAmpliacion>,

        @InjectRepository(Edificio)
        private readonly edificiosRepo: Repository<Edificio>,

        private readonly historialService: HistorialEdificioService,
    ) { }

    // 🔹 Crear una nueva ampliación
    async create(dto: CreateAmpliacionDto, usuarioId: number) {
        const edificio = await this.edificiosRepo.findOne({ where: { id: dto.edificio_id } });
        if (!edificio) {
            throw new NotFoundException(`El edificio con ID ${dto.edificio_id} no existe`);
        }

        const nuevaAmpliacion = this.ampliacionesRepo.create({
            ...dto,
            edificio,
        });

        const ampliacionGuardada = await this.ampliacionesRepo.save(nuevaAmpliacion);

        // Registrar acción en el historial
        await this.historialService.registrarAccion({
            edificioId: edificio.id,
            usuarioId,
            accion: 'AMPLIAR',
            descripcion: `Se registró una ampliación del edificio (${edificio.nombre_bien}).`,
        });

        return ampliacionGuardada;
    }

    // 🔹 Listar todas las ampliaciones
    async findAll() {
        return this.ampliacionesRepo.find({
            relations: ['edificio'],
            order: { created_at: 'DESC' },
        });
    }

    // 🔹 Obtener una ampliación específica
    async findOne(id: number) {
        const ampliacion = await this.ampliacionesRepo.findOne({
            where: { id },
            relations: ['edificio'],
        });
        if (!ampliacion) throw new NotFoundException('Ampliación no encontrada');
        return ampliacion;
    }

    // 🔹 Actualizar una ampliación existente
    async update(id: number, dto: UpdateAmpliacionDto, usuarioId: number) {
        const ampliacion = await this.ampliacionesRepo.findOne({ where: { id } });
        if (!ampliacion) throw new NotFoundException('Ampliación no encontrada');

        Object.assign(ampliacion, dto);
        const actualizada = await this.ampliacionesRepo.save(ampliacion);

        await this.historialService.registrarAccion({
            edificioId: ampliacion.edificio?.id ?? dto.edificio_id!,
            usuarioId,
            accion: 'EDITAR_AMPLIACION',
            descripcion: `Se actualizó una ampliación del edificio.`,
        });

        return actualizada;
    }

    // 🔹 Eliminar o inactivar una ampliación
    async remove(id: number, usuarioId: number) {
        const ampliacion = await this.ampliacionesRepo.findOne({ where: { id } });
        if (!ampliacion) throw new NotFoundException('Ampliación no encontrada');

        await this.ampliacionesRepo.remove(ampliacion);

        await this.historialService.registrarAccion({
            edificioId: ampliacion.edificio?.id,
            usuarioId,
            accion: 'ELIMINAR_AMPLIACION',
            descripcion: `Se eliminó una ampliación del edificio.`,
        });

        return { message: 'Ampliación eliminada correctamente' };
    }
}
