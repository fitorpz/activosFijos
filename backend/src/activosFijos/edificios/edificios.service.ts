import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Edificio } from './entities/edificio.entity';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import { Personal } from 'src/parametros/personal/entities/personales.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { Cargo } from 'src/parametros/cargos/entities/cargos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { generarPDFDesdeHTML } from 'src/utils/generarPDF';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HistorialEdificioService } from './historial/historial-edificio.service';

@Injectable()
export class EdificiosService {
    constructor(
        @InjectRepository(Edificio)
        private readonly edificioRepo: Repository<Edificio>,

        @InjectRepository(Personal)
        private readonly personalRepo: Repository<Personal>,

        @InjectRepository(Cargo)
        private readonly cargoRepo: Repository<Cargo>,

        @InjectRepository(UnidadOrganizacional)
        private readonly unidadOrgRepo: Repository<UnidadOrganizacional>,

        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,

        private readonly historialService: HistorialEdificioService,
    ) { }

    async create(dto: CreateEdificioDto): Promise<Edificio> {
        const responsable = await this.personalRepo.findOneBy({ id: dto.responsable_id });
        const cargo = await this.cargoRepo.findOneBy({ id: dto.cargo_id });
        const unidad = await this.unidadOrgRepo.findOneBy({ id: dto.unidad_organizacional_id });
        const creadoPor = await this.usuarioRepo.findOneBy({ id: dto.creado_por_id });

        if (!responsable || !cargo || !unidad || !creadoPor) {
            throw new NotFoundException('Referencias inválidas en la creación del edificio');
        }

        const actualizadoPor = dto.actualizado_por_id
            ? await this.usuarioRepo.findOneBy({ id: dto.actualizado_por_id })
            : undefined;

        const payload: Partial<Edificio> = {
            ...dto,
            responsable,
            cargo,
            unidad_organizacional: unidad,
            creado_por: creadoPor,
        };

        if (actualizadoPor) payload.actualizado_por = actualizadoPor;

        const nuevo = this.edificioRepo.create(payload);
        const edificioCreado = await this.edificioRepo.save(nuevo);
        await this.historialService.registrarAccion(edificioCreado, creadoPor, 'Creó un nuevo edificio');
        return this.edificioRepo.save(nuevo);
    }

    async findAll(): Promise<Edificio[]> {
        return this.edificioRepo.find({
            relations: [
                'responsable',
                'cargo',
                'unidad_organizacional',
                'creado_por',
                'actualizado_por',
            ],
        });
    }

    async findOne(id: number): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOne({
            where: { id },
            relations: [
                'responsable',
                'cargo',
                'unidad_organizacional',
                'creado_por',
                'actualizado_por',
            ],
        });

        if (!edificio) {
            throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
        }

        return edificio;
    }

    async update(id: number, dto: UpdateEdificioDto): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOne({
            where: { id },
            relations: [
                'responsable',
                'cargo',
                'unidad_organizacional',
                'creado_por',
                'actualizado_por',
            ],
        });

        if (!edificio) {
            throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
        }

        if (dto.responsable_id) {
            const responsable = await this.personalRepo.findOneBy({ id: dto.responsable_id });
            if (responsable) edificio.responsable = responsable;
        }

        if (dto.cargo_id) {
            const cargo = await this.cargoRepo.findOneBy({ id: dto.cargo_id });
            if (cargo) edificio.cargo = cargo;
        }

        if (dto.unidad_organizacional_id) {
            const unidad = await this.unidadOrgRepo.findOneBy({ id: dto.unidad_organizacional_id });
            if (unidad) edificio.unidad_organizacional = unidad;
        }

        if (dto.actualizado_por_id) {
            const actualizadoPor = await this.usuarioRepo.findOneBy({ id: dto.actualizado_por_id });
            if (actualizadoPor) edificio.actualizado_por = actualizadoPor;
        }

        Object.assign(edificio, dto);

        const edificioActualizado = await this.edificioRepo.save(edificio);

        // 👇 Solo registrar si existe el usuario que actualiza
        if (dto.actualizado_por_id) {
            const usuario = await this.usuarioRepo.findOneBy({ id: dto.actualizado_por_id });
            if (usuario) {
                await this.historialService.registrarAccion(
                    edificioActualizado,
                    usuario,
                    `Actualizó datos del edificio (ID: ${id})`,
                );
            }
        }


        return this.edificioRepo.save(edificio);
    }

    async remove(id: number): Promise<void> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) {
            throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
        }
        await this.edificioRepo.softDelete(id);
    }

    async cambiarEstado(id: number, userId: number): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) {
            throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
        }

        const usuario = await this.usuarioRepo.findOneBy({ id: userId });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        edificio.estado = edificio.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        edificio.actualizado_por = usuario;

        const edificioGuardado = await this.edificioRepo.save(edificio);

        // 👇 Registrar en historial
        await this.historialService.registrarAccion(
            edificioGuardado,
            usuario,
            `Cambió el estado del edificio a ${edificioGuardado.estado}`,
        );

        return this.edificioRepo.save(edificio);
    }

    async exportarPdf(estado: string): Promise<Buffer> {
        const registros = await this.findAll();

        const filtrados = estado && estado !== 'todos'
            ? registros.filter(e => e.estado === estado)
            : registros;

        const filasHTML = filtrados.map((edificio, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${edificio.nro_da}</td>
        <td>${edificio.nombre_bien}</td>
        <td>${edificio.clasificacion}</td>
        <td>${edificio.unidad_organizacional?.descripcion || ''}</td>
        <td>${edificio.ubicacion}</td>
        <td>${edificio.estado}</td>
      </tr>`
        ).join('');

        const rutaTemplate = join(__dirname, '../../../templates/pdf/activosFijos/edificios-pdf.html');
        const template = readFileSync(rutaTemplate, 'utf8');
        const htmlFinal = template.replace('<!-- FILAS_EDIFICIOS -->', filasHTML);

        return generarPDFDesdeHTML(htmlFinal);
    }
    async actualizarArchivoPdf(id: number, ruta: string): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) throw new NotFoundException('Edificio no encontrado');
        edificio.archivo_respaldo_pdf = ruta;
        return this.edificioRepo.save(edificio);
    }

    async actualizarFotos(id: number, rutas: string[]): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) throw new NotFoundException('Edificio no encontrado');
        edificio.fotos_edificio = [...(edificio.fotos_edificio || []), ...rutas];
        return this.edificioRepo.save(edificio);
    }

}
