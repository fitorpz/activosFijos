import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Area } from '../areas/entities/areas.entity';
import { UnidadOrganizacional } from './entities/unidad-organizacional.entity';
import { CreateUnidadOrganizacionalDto } from './dto/create-unidad-organizacional.dto';
import { UpdateUnidadOrganizacionalDto } from './dto/update-unidad-organizacional.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Like } from 'typeorm';

@Injectable()
export class UnidadesOrganizacionalesService {
  constructor(
    @InjectRepository(UnidadOrganizacional)
    private readonly unidadRepo: Repository<UnidadOrganizacional>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>
  ) { }

  async create(dto: CreateUnidadOrganizacionalDto): Promise<UnidadOrganizacional> {
    const usuario = await this.usuarioRepo.findOneBy({ id: dto.creado_por_id });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${dto.creado_por_id} no encontrado`);

    const nueva = this.unidadRepo.create({
      ...dto,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
      creado_por_id: usuario.id,
    });

    return this.unidadRepo.save(nueva);
  }


  async findAll(estado?: string, area_id?: number): Promise<UnidadOrganizacional[]> {
    const query = this.unidadRepo.createQueryBuilder('unidad')
      .leftJoinAndSelect('unidad.area', 'area')
      .leftJoin('unidad.creado_por', 'creado_por')
      .leftJoin('unidad.actualizado_por', 'actualizado_por')
      .addSelect([
        'creado_por.id',
        'creado_por.nombre',
        'actualizado_por.id',
        'actualizado_por.nombre',
      ])
      .where('unidad.deleted_at IS NULL')
      .orderBy('unidad.codigo', 'ASC');

    if (estado && estado !== 'todos') {
      query.andWhere('unidad.estado = :estado', { estado: estado.toUpperCase() });
    }

    if (area_id) {
      query.andWhere('unidad.area_id = :area_id', { area_id });
    }

    return query.getMany();
  }


  async findOne(id: number): Promise<UnidadOrganizacional> {
    const unidad = await this.unidadRepo
      .createQueryBuilder('unidad')
      .leftJoinAndSelect('unidad.area', 'area')
      .leftJoin('unidad.creado_por', 'creado_por')
      .leftJoin('unidad.actualizado_por', 'actualizado_por')
      .addSelect([
        'creado_por.id',
        'creado_por.nombre',
        'actualizado_por.id',
        'actualizado_por.nombre',
      ])
      .where('unidad.id = :id', { id })
      .getOne();

    if (!unidad) throw new NotFoundException('Unidad organizacional no encontrada');
    return unidad;
  }
  async update(id: number, dto: UpdateUnidadOrganizacionalDto): Promise<UnidadOrganizacional> {
    const unidad = await this.findOne(id);

    if (dto.actualizado_por_id) {
      const usuario = await this.usuarioRepo.findOneBy({ id: dto.actualizado_por_id });
      if (!usuario) throw new NotFoundException(`Usuario con ID ${dto.actualizado_por_id} no encontrado`);
      unidad.actualizado_por = usuario;
      unidad.actualizado_por_id = usuario.id;
    }

    if (dto.codigo !== undefined) unidad.codigo = dto.codigo;
    if (dto.descripcion !== undefined) unidad.descripcion = dto.descripcion;
    if (dto.estado !== undefined) unidad.estado = dto.estado;
    if (dto.area_id !== undefined) unidad.area_id = dto.area_id;

    return this.unidadRepo.save(unidad);
  }
  async remove(id: number): Promise<{ message: string }> {
    const unidad = await this.findOne(id);
    unidad.estado = 'INACTIVO';
    await this.unidadRepo.save(unidad);
    return { message: 'Unidad organizacional marcada como INACTIVA' };
  }

  async cambiarEstado(id: number, userId: number): Promise<UnidadOrganizacional> {
    const unidad = await this.unidadRepo.findOne({
      where: { id },
      relations: ['actualizado_por'],
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException('Usuario no válido');
    }

    unidad.estado = unidad.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    unidad.actualizado_por = usuario;
    unidad.updated_at = new Date();

    return await this.unidadRepo.save(unidad);
  }


  async restaurar(id: number): Promise<void> {
    await this.unidadRepo.restore(id);
  }

  async contarPorAreaId(areaId: number): Promise<number> {
    return this.unidadRepo
      .createQueryBuilder('unidad')
      .where('unidad.area_id = :areaId', { areaId })
      .getCount();
  }

  async contarPorCodigoArea(codigoArea: string): Promise<number> {
    return this.unidadRepo
      .createQueryBuilder('unidad')
      .where('unidad.codigo LIKE :pattern', { pattern: `${codigoArea}.%` })
      .getCount();
  }


  async buscar(params: { q?: string; estado?: string; area_id?: number }) {
    const { q, estado, area_id } = params;

    const qb = this.unidadRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.area', 'area') // si tienes relación
      .orderBy('u.codigo', 'ASC');

    if (estado && estado !== 'todos') {
      qb.andWhere('u.estado = :estado', { estado: estado.toUpperCase() });
    }

    if (typeof area_id === 'number') {
      qb.andWhere('u.area_id = :area_id', { area_id });  // 👈 filtro por área
    }

    if (q && q.trim() !== '') {
      qb.andWhere('(LOWER(u.codigo) LIKE :t OR LOWER(u.descripcion) LIKE :t)', {
        t: `%${q.toLowerCase()}%`,
      });
    }

    return qb.getMany();
  }

  async generarSiguienteCodigo(area_id: number): Promise<{ codigo: string }> {
    const area = await this.areaRepo.findOne({ where: { id: area_id } });
    if (!area) throw new NotFoundException(`Área con ID ${area_id} no encontrada`);

    // Buscar todas las unidades de esa área
    const unidades = await this.unidadRepo.find({
      where: { area_id },
      order: { codigo: 'ASC' },
    });

    // Si no hay unidades, empieza desde 0001
    if (unidades.length === 0) {
      return { codigo: `${area.codigo}.0001` };
    }

    // Buscar el máximo correlativo según el formato del código del área
    let maxCorrelativo = 0;
    for (const unidad of unidades) {
      const partes = unidad.codigo.split('.');
      const partesArea = area.codigo.split('.');
      const indexCorrelativo = partesArea.length;
      const correlativoStr = partes[indexCorrelativo] ?? '';
      const correlativoNum = parseInt(correlativoStr, 10);

      if (!isNaN(correlativoNum) && correlativoNum > maxCorrelativo) {
        maxCorrelativo = correlativoNum;
      }
    }

    const siguiente = (maxCorrelativo + 1).toString().padStart(4, '0');
    return { codigo: `${area.codigo}.${siguiente}` };
  }

}
