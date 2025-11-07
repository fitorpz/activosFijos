import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
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

    // 🧩 Generar correlativo incremental de 4 dígitos
    private async generarNuevoCorrelativo(): Promise<string> {
        const ultimo = await this.edificioRepo.find({
            order: { id: 'DESC' },
            take: 1,
        });

        if (ultimo.length === 0) return '0001';

        const ultimoCodigo = ultimo[0].codigo_correlativo ?? '0000';
        const siguiente = (parseInt(ultimoCodigo, 10) + 1).toString().padStart(4, '0');
        return siguiente;
    }

    // 🧩 Construir el código completo GAMS
    private construirCodigoCompleto(dto: CreateEdificioDto): string {
        const partes = [
            dto.codigo_gobierno ?? 'GAMS',
            dto.codigo_institucional ?? '1101',
            dto.codigo_direccion_administrativa,
            dto.codigo_distrito,
            dto.codigo_sector_area,
            dto.codigo_unidad_organizacional,
            dto.codigo_cargo,
            dto.codigo_ambiente,
            dto.codigo_grupo_contable,
            dto.codigo_correlativo,
        ];

        return partes.join('.');
    }

    // 🔹 Crear un nuevo edificio
    async create(dto: CreateEdificioDto): Promise<Edificio> {
        const responsable = await this.personalRepo.findOneBy({
            id: dto.responsable_id,
        });
        const unidad = await this.unidadOrgRepo.findOneBy({
            id: dto.unidad_organizacional_id,
        });
        const creadoPor = await this.usuarioRepo.findOneBy({
            id: dto.creado_por_id,
        });

        if (!responsable || !unidad || !creadoPor) {
            throw new NotFoundException(
                'Referencias inválidas en la creación del edificio',
            );
        }

        const cargo = dto.codigo_cargo
            ? await this.cargoRepo.findOneBy({ id: dto.cargo_id })
            : null;

        const actualizadoPor = dto.actualizado_por_id
            ? await this.usuarioRepo.findOneBy({ id: dto.actualizado_por_id })
            : undefined;

        // 🧮 Generar correlativo si no fue enviado
        if (!dto.codigo_correlativo) {
            dto.codigo_correlativo = await this.generarNuevoCorrelativo();
        }

        // 🧩 Generar código completo concatenado
        const codigoCompleto = this.construirCodigoCompleto(dto);

        // Validar que no exista
        const existe = await this.edificioRepo.findOne({
            where: { codigo_completo: codigoCompleto },
        });
        if (existe) {
            throw new BadRequestException(
                `El código ${codigoCompleto} ya existe en otro edificio`,
            );
        }

        // 🧱 Crear entidad
        const payload = this.edificioRepo.create({
            ...dto,
            codigo_completo: codigoCompleto,
        });

        payload.responsable = responsable;
        payload.cargo = cargo!;
        payload.unidad_organizacional = unidad;
        payload.creado_por = creadoPor;

        if (actualizadoPor) payload.actualizado_por = actualizadoPor;

        const nuevo = this.edificioRepo.create(payload);
        const edificioCreado = await this.edificioRepo.save(payload);

        // 📜 Registrar en historial
        await this.historialService.registrarAccion({
            edificioId: edificioCreado.id,
            usuarioId: creadoPor.id,
            accion: 'CREAR_EDIFICIO',
            descripcion: `Se creó un nuevo edificio (${edificioCreado.nombre_bien}) con código ${edificioCreado.codigo_completo}.`,
        });

        return edificioCreado;
    }

    // 🔹 Listar todos los edificios
    async findAll(): Promise<Edificio[]> {
        return this.edificioRepo.find({
            relations: [
                'responsable',
                'cargo',
                'unidad_organizacional',
                'creado_por',
                'actualizado_por',
            ],
            order: { id: 'ASC' },
        });
    }

    // 🔹 Buscar edificio por ID
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

    // 🔹 Actualizar edificio
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
            const responsable = await this.personalRepo.findOneBy({
                id: dto.responsable_id,
            });
            if (responsable) edificio.responsable = responsable;
        }

        if (dto.cargo_id) {
            const cargo = await this.cargoRepo.findOneBy({ id: dto.cargo_id });
            if (cargo) edificio.cargo = cargo;
        }

        if (dto.unidad_organizacional_id) {
            const unidad = await this.unidadOrgRepo.findOneBy({
                id: dto.unidad_organizacional_id,
            });
            if (unidad) edificio.unidad_organizacional = unidad;
        }

        if (dto.actualizado_por_id) {
            const actualizadoPor = await this.usuarioRepo.findOneBy({
                id: dto.actualizado_por_id,
            });
            if (actualizadoPor) edificio.actualizado_por = actualizadoPor;
        }

        Object.assign(edificio, dto);

        // 🧩 Si cambian los componentes de codificación, reconstruimos el código
        if (
            dto.codigo_direccion_administrativa ||
            dto.codigo_distrito ||
            dto.codigo_sector_area ||
            dto.codigo_unidad_organizacional ||
            dto.codigo_cargo ||
            dto.codigo_ambiente ||
            dto.codigo_grupo_contable ||
            dto.codigo_correlativo
        ) {
            edificio.codigo_completo = this.construirCodigoCompleto({
                ...edificio,
            } as any);
        }

        const edificioActualizado = await this.edificioRepo.save(edificio);

        if (dto.actualizado_por_id) {
            await this.historialService.registrarAccion({
                edificioId: edificioActualizado.id,
                usuarioId: dto.actualizado_por_id,
                accion: 'EDITAR_EDIFICIO',
                descripcion: `Actualizó datos del edificio (ID: ${id}).`,
            });
        }

        return edificioActualizado;
    }

    // 🔹 Eliminar edificio (borrado lógico)
    async remove(id: number): Promise<void> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) {
            throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
        }
        await this.edificioRepo.softDelete(id);
    }

    // 🔹 Cambiar estado (ACTIVO / INACTIVO)
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

        await this.historialService.registrarAccion({
            edificioId: edificioGuardado.id,
            usuarioId: userId,
            accion: 'CAMBIAR_ESTADO',
            descripcion: `Cambió el estado del edificio a ${edificioGuardado.estado}.`,
        });

        return edificioGuardado;
    }

    // 🔹 Exportar PDF
    async exportarPdf(estado: string): Promise<Buffer> {
        const registros = await this.findAll();

        const filtrados =
            estado && estado !== 'todos'
                ? registros.filter((e) => e.estado === estado)
                : registros;

        const filasHTML = filtrados
            .map(
                (edificio, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${edificio.codigo_completo}</td>
        <td>${edificio.nombre_bien}</td>
        <td>${edificio.clasificacion}</td>
        <td>${edificio.unidad_organizacional ? edificio.unidad_organizacional.descripcion : ''}</td>
        <td>${edificio.ubicacion}</td>
        <td>${edificio.estado}</td>
      </tr>`,
            )
            .join('');

        const rutaTemplate = join(
            __dirname,
            '../../../templates/pdf/activosFijos/edificios-pdf.html',
        );
        const template = readFileSync(rutaTemplate, 'utf8');
        const htmlFinal = template.replace('<!-- FILAS_EDIFICIOS -->', filasHTML);

        return generarPDFDesdeHTML(htmlFinal);
    }

    // 🔹 Actualizar archivo PDF
    async actualizarArchivoPdf(id: number, ruta: string): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) throw new NotFoundException('Edificio no encontrado');
        edificio.archivo_respaldo_pdf = ruta;
        return this.edificioRepo.save(edificio);
    }

    // 🔹 Agregar fotos al edificio
    async actualizarFotos(id: number, rutas: string[]): Promise<Edificio> {
        const edificio = await this.edificioRepo.findOneBy({ id });
        if (!edificio) throw new NotFoundException('Edificio no encontrado');
        edificio.fotos_edificio = [...(edificio.fotos_edificio || []), ...rutas];
        return this.edificioRepo.save(edificio);
    }
}
