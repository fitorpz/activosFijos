import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdificioRemodelacion } from '../entities/edificio-remodelacion.entity';
import { Edificio } from '../entities/edificio.entity';
import { CreateRemodelacionDto } from '../dto/create-remodelacion.dto';
import { UpdateRemodelacionDto } from '../dto/update-remodelacion.dto';
import { HistorialEdificioService } from '../historial/historial-edificio.service';

@Injectable()
export class RemodelacionesService {
    constructor(
        @InjectRepository(EdificioRemodelacion)
        private readonly remodelacionesRepo: Repository<EdificioRemodelacion>,

        @InjectRepository(Edificio)
        private readonly edificiosRepo: Repository<Edificio>,

        private readonly historialService: HistorialEdificioService,
    ) { }

    // 🔹 Crear una nueva remodelación
    async create(dto: CreateRemodelacionDto, usuarioId: number) {
        const edificio = await this.edificiosRepo.findOne({ where: { id: dto.edificio_id } });
        if (!edificio) {
            throw new NotFoundException(`El edificio con ID ${dto.edificio_id} no existe`);
        }

        const nuevaRemodelacion = this.remodelacionesRepo.create({
            ...dto,
            edificio,
        });

        const guardada = await this.remodelacionesRepo.save(nuevaRemodelacion);

        await this.historialService.registrarAccion({
            edificioId: edificio.id,
            usuarioId,
            accion: 'REMODELAR',
            descripcion: `Se registró una remodelación del edificio (${edificio.nombre_bien}).`,
        });

        return guardada;
    }

    // 🔹 Listar todas las remodelaciones
    async findAll() {
        return this.remodelacionesRepo.find({
            relations: ['edificio'],
            order: { created_at: 'DESC' },
        });
    }

    // 🔹 Listar todas las remodelaciones de un edificio específico
    async findByEdificio(edificioId: number) {
        return this.remodelacionesRepo.find({
            where: { edificio: { id: edificioId } },
            relations: ['edificio'],
            order: { created_at: 'DESC' },
        });
    }


    // 🔹 Buscar una remodelación por ID
    async findOne(id: number) {
        const remodelacion = await this.remodelacionesRepo.findOne({
            where: { id },
            relations: ['edificio'],
        });
        if (!remodelacion) throw new NotFoundException('Remodelación no encontrada');
        return remodelacion;
    }

    // 🔹 Actualizar remodelación
    async update(id: number, dto: UpdateRemodelacionDto, usuarioId: number) {
        const remodelacion = await this.remodelacionesRepo.findOne({ where: { id } });
        if (!remodelacion) throw new NotFoundException('Remodelación no encontrada');

        Object.assign(remodelacion, dto);
        const actualizada = await this.remodelacionesRepo.save(remodelacion);

        await this.historialService.registrarAccion({
            edificioId: remodelacion.edificio?.id ?? dto.edificio_id!,
            usuarioId,
            accion: 'EDITAR_REMODELACION',
            descripcion: 'Se actualizó una remodelación del edificio.',
        });

        return actualizada;
    }

    // 🔹 Eliminar remodelación
    async remove(id: number, usuarioId: number) {
        const remodelacion = await this.remodelacionesRepo.findOne({ where: { id }, relations: ['edificio'] });
        if (!remodelacion) throw new NotFoundException('Remodelación no encontrada');

        await this.remodelacionesRepo.remove(remodelacion);

        await this.historialService.registrarAccion({
            edificioId: remodelacion.edificio?.id!,
            usuarioId,
            accion: 'ELIMINAR_REMODELACION',
            descripcion: `Se eliminó una remodelación del edificio.`,
        });

        return { message: 'Remodelación eliminada correctamente' };
    }
}
