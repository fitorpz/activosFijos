import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ambiente } from './entities/ambiente.entity';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class AmbientesService {
  constructor(
    @InjectRepository(Ambiente)
    private readonly ambienteRepo: Repository<Ambiente>,

    @InjectRepository(UnidadOrganizacional)
    private readonly unidadRepo: Repository<UnidadOrganizacional>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  async create(dto: CreateAmbienteDto): Promise<Ambiente> {
    const usuario = await this.usuarioRepo.findOneBy({ id: dto.creado_por_id });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${dto.creado_por_id} no encontrado`);

    const unidad = await this.unidadRepo.findOne({
      select: ['id', 'codigo'],
      where: { id: dto.unidad_organizacional_id },
    });
    if (!unidad) throw new NotFoundException('Unidad organizacional no encontrada');

    if (!unidad.codigo?.trim()) {
      throw new Error('La unidad organizacional no tiene un código válido');
    }

    const total = await this.contarPorUnidad(unidad.id);
    const correlativo = String(total + 1).padStart(2, '0');
    const codigo = `${unidad.codigo}.${correlativo}`;

    const nuevo = this.ambienteRepo.create({
      descripcion: dto.descripcion,
      unidad_organizacional_id: unidad.id,
      codigo,
      estado: 'ACTIVO',
      creado_por_id: usuario.id,
      creado_por: usuario,
    });

    return this.ambienteRepo.save(nuevo);
  }


  async findAll(estado?: string): Promise<Ambiente[]> {
    const query = this.ambienteRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.unidad_organizacional', 'u')
      .leftJoinAndSelect('u.area', 'area')
      .leftJoin('a.creado_por', 'creado')
      .leftJoin('a.actualizado_por', 'actualizado')
      .addSelect(['creado.id', 'creado.nombre', 'actualizado.id', 'actualizado.nombre'])
      .orderBy('area.codigo', 'ASC')
      .addOrderBy('u.codigo', 'ASC')
      .addOrderBy('a.codigo', 'ASC');

    if (estado && estado !== 'todos') {
      query.andWhere('a.estado = :estado', { estado: estado.toUpperCase() });
    }

    query.take(2000);
    return query.getMany();
  }

  async findOne(id: number): Promise<Ambiente> {
    const ambiente = await this.ambienteRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.unidad_organizacional', 'u')
      .leftJoinAndSelect('u.area', 'area')
      .leftJoin('a.creado_por', 'creado')
      .leftJoin('a.actualizado_por', 'actualizado')
      .addSelect(['creado.id', 'creado.nombre', 'actualizado.id', 'actualizado.nombre'])
      .where('a.id = :id', { id })
      .getOne();

    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
    return ambiente;
  }

  async findOneLite(id: number): Promise<Ambiente> {
    const ambiente = await this.ambienteRepo.findOne({
      where: { id },
      select: [
        'id',
        'codigo',
        'descripcion',
        'estado',
        'unidad_organizacional_id',
        'creado_por_id',
        'actualizado_por_id',
        'created_at',
        'updated_at',
      ],
    });
    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
    return ambiente;
  }

  async update(id: number, dto: UpdateAmbienteDto, userId?: number): Promise<Ambiente> {
    const ambiente = await this.ambienteRepo.findOneBy({ id });
    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');

    const updates: Partial<Ambiente> = {};

    if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion;
    if (dto.codigo && dto.codigo.trim() !== '') updates.codigo = dto.codigo.trim();

    if (
      dto.unidad_organizacional_id &&
      dto.unidad_organizacional_id !== ambiente.unidad_organizacional_id
    ) {
      const unidad = await this.unidadRepo.findOne({
        select: ['id'],
        where: { id: dto.unidad_organizacional_id },
      });
      if (!unidad) throw new NotFoundException('Unidad organizacional no encontrada');
      updates.unidad_organizacional_id = unidad.id;
    }

    if (userId) {
      const usuario = await this.usuarioRepo.findOne({
        select: ['id'],
        where: { id: userId },
      });
      if (usuario) {
        updates.actualizado_por_id = usuario.id;
        updates.updated_at = new Date();
      }
    }

    await this.ambienteRepo.update(id, updates);
    return this.findOneLite(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ambiente = await this.ambienteRepo.findOneBy({ id });
    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');

    await this.ambienteRepo.update(id, { estado: 'INACTIVO' });
    return { message: 'Ambiente marcado como INACTIVO' };
  }

  async cambiarEstado(id: number, userId: number): Promise<Ambiente> {
    const ambiente = await this.ambienteRepo.findOneBy({ id });
    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');

    const usuario = await this.usuarioRepo.findOne({
      select: ['id'],
      where: { id: userId },
    });
    if (!usuario) throw new NotFoundException('Usuario no válido');

    const nuevoEstado = ambiente.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    await this.ambienteRepo.update(id, {
      estado: nuevoEstado,
      actualizado_por_id: usuario.id,
      updated_at: new Date(),
    });

    return this.findOneLite(id);
  }

  async contarPorUnidad(unidadId: number): Promise<number> {
    return this.ambienteRepo
      .createQueryBuilder('a')
      .where('a.unidad_organizacional_id = :unidadId', { unidadId })
      .getCount();
  }

  async buscarPorUnidadYTexto(unidadId: number, texto: string): Promise<Ambiente[]> {
    return this.ambienteRepo
      .createQueryBuilder('a')
      .where('a.unidad_organizacional_id = :unidadId', { unidadId })
      .andWhere('a.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('(LOWER(a.descripcion) LIKE :t OR LOWER(a.codigo) LIKE :t)', {
        t: `%${texto.toLowerCase()}%`,
      })
      .orderBy('a.codigo', 'ASC')
      .take(10)
      .getMany();
  }
}
