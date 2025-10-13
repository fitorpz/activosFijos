import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Edificio } from '../activosFijos/edificios/entities/edificio.entity';
import { UnidadOrganizacional } from '../parametros/unidades-organizacionales/entities/unidad-organizacional.entity';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Edificio)
        private readonly edificioRepository: Repository<Edificio>,
        @InjectRepository(UnidadOrganizacional)
        private readonly unidadRepository: Repository<UnidadOrganizacional>,
    ) { }

    async obtenerTodos(): Promise<Edificio[]> {
        return this.edificioRepository.find({
            where: { estado: 'ACTIVO' },
            order: { codigo_311: 'ASC' },
        });
    }

    async filtrar(
        area_id: number,
        unidad_id: number,
        ambiente_id: number,
        cargo_id: number,
    ): Promise<Edificio[]> {
        return this.edificioRepository.find({
            where: {
                area_id,
                unidad_organizacional_id: unidad_id,
                ambiente_id,
                cargo_id,
                estado: 'ACTIVO',
            },
            order: { codigo_311: 'ASC' },
        });
    }

    async obtenerPorIds(ids: number[]): Promise<any[]> {
        const edificios = await this.edificioRepository.find({
            where: {
                id_311: In(ids),
                estado: 'ACTIVO',
            },
            order: {
                codigo_311: 'ASC',
            }
        });

        // Enriquecer con nombre de unidad organizacional
        const unidadIds = edificios
            .map(e => e.unidad_organizacional_id)
            .filter(id => !!id);

        const unidades = await this.unidadRepository.find({
            where: { id: In(unidadIds) },
            select: ['id', 'descripcion'],
        });

        const mapaUnidades = new Map(unidades.map(u => [u.id, u.descripcion]));

        const resultado = edificios.map(edificio => ({
            ...edificio,
            unidad_organizacional_nombre: mapaUnidades.get(edificio.unidad_organizacional_id) ?? '—',
        }));

        return resultado;
    }
}
