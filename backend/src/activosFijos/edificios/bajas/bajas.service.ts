import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdificioBaja } from '../entities/edificio-baja.entity';
import { Edificio } from '../entities/edificio.entity';
import { CreateBajaDto } from '../dto/create-baja.dto';
import { UpdateBajaDto } from '../dto/update-baja.dto';
import { HistorialEdificioService } from '../historial/historial-edificio.service';

@Injectable()
export class BajasService {
    constructor(
        @InjectRepository(EdificioBaja)
        private readonly bajasRepo: Repository<EdificioBaja>,

        @InjectRepository(Edificio)
        private readonly edificiosRepo: Repository<Edificio>,

        private readonly historialService: HistorialEdificioService,
    ) { }

    // 🔹 Crear una nueva baja de edificio
    async create(dto: CreateBajaDto, usuarioId: number) {
        const edificio = await this.edificiosRepo.findOne({ where: { id: dto.edificio_id } });
        if (!edificio) {
            throw new NotFoundException(`El edificio con ID ${dto.edificio_id} no existe`);
        }

        const nuevaBaja = this.bajasRepo.create({
            ...dto,
            edificio,
        });

        const guardada = await this.bajasRepo.save(nuevaBaja);

        await this.historialService.registrarAccion({
            edificioId: edificio.id,
            usuarioId,
            accion: 'BAJA',
            descripcion: `Se registró la baja del edificio (${edificio.nombre_bien}).`,
        });

        return guardada;
    }

    // 🔹 Listar todas las bajas
    async findAll() {
        return this.bajasRepo.find({
            relations: ['edificio'],
            order: { created_at: 'DESC' },
        });
    }

    // 🔹 Buscar una baja por ID
    async findOne(id: number) {
        const baja = await this.bajasRepo.findOne({
            where: { id },
            relations: ['edificio'],
        });
        if (!baja) throw new NotFoundException('Baja no encontrada');
        return baja;
    }

    // 🔹 Actualizar una baja
    async update(id: number, dto: UpdateBajaDto, usuarioId: number) {
        const baja = await this.bajasRepo.findOne({ where: { id } });
        if (!baja) throw new NotFoundException('Baja no encontrada');

        Object.assign(baja, dto);
        const actualizada = await this.bajasRepo.save(baja);

        await this.historialService.registrarAccion({
            edificioId: baja.edificio?.id ?? dto.edificio_id!,
            usuarioId,
            accion: 'EDITAR_BAJA',
            descripcion: 'Se actualizó el registro de baja del edificio.',
        });

        return actualizada;
    }

    // 🔹 Eliminar baja
    async remove(id: number, usuarioId: number) {
        const baja = await this.bajasRepo.findOne({ where: { id }, relations: ['edificio'] });
        if (!baja) throw new NotFoundException('Baja no encontrada');

        await this.bajasRepo.remove(baja);

        await this.historialService.registrarAccion({
            edificioId: baja.edificio?.id!,
            usuarioId,
            accion: 'ELIMINAR_BAJA',
            descripcion: `Se eliminó una baja del edificio.`,
        });

        return { message: 'Baja eliminada correctamente' };
    }
}
