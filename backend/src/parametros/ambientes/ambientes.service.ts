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

  async create(dto: CreateAmbienteDto, userId: number): Promise<Ambiente> {
    const unidad = await this.unidadRepo.findOneBy({ id: dto.unidad_organizacional_id });
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!unidad) throw new NotFoundException('Unidad organizacional no encontrada');
    if (!usuario) throw new NotFoundException('Usuario no válido');

    // Generar código correlativo
    const count = await this.ambienteRepo.count({
      where: { unidad_organizacional_id: unidad.id },
    });

    const numeroStr = (count + 1).toString().padStart(2, '0');
    const codigoFinal = `${unidad.codigo}.${numeroStr}`;

    const nuevo = this.ambienteRepo.create({
      codigo: codigoFinal,
      descripcion: dto.descripcion,
      estado: 'ACTIVO',
      unidad_organizacional: unidad,
      unidad_organizacional_id: unidad.id,
      creado_por: usuario,
      creado_por_id: usuario.id,
    });

    return this.ambienteRepo.save(nuevo);
  }

  async findAll(estado?: string): Promise<Ambiente[]> {
  const query = this.ambienteRepo.createQueryBuilder('ambiente')
    .leftJoinAndSelect('ambiente.unidad_organizacional', 'unidad')
    .leftJoinAndSelect('unidad.area', 'area')
    .leftJoinAndSelect('ambiente.creado_por', 'creado_por')
    .leftJoinAndSelect('ambiente.actualizado_por', 'actualizado_por')
    .orderBy('unidad.area', 'ASC')
    .addOrderBy('ambiente.unidad_organizacional', 'ASC')
    .addOrderBy('ambiente.codigo', 'ASC'); // Asegúrate de que 'codigo' exista

  if (estado && estado !== 'todos') {
    query.where('ambiente.estado = :estado', { estado: estado.toUpperCase() });
  }

  return query.getMany();
}


  async findOne(id: number): Promise<Ambiente> {
    const ambiente = await this.ambienteRepo.findOne({
      where: { id },
      relations: ['unidad_organizacional', 'unidad_organizacional.area', 'creado_por', 'actualizado_por'],
    });

    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');
    return ambiente;
  }

  async update(id: number, updateDto: UpdateAmbienteDto): Promise<Ambiente> {
    const ambiente = await this.ambienteRepo.findOne({
      where: { id },
      relations: ['unidad_organizacional'],
    });

    if (!ambiente) throw new NotFoundException('Ambiente no encontrado');

    // Actualizar campos solo si fueron enviados
    if (updateDto.descripcion !== undefined) {
      ambiente.descripcion = updateDto.descripcion;
    }

    if (updateDto.codigo !== undefined) {
      ambiente.codigo = updateDto.codigo;
    }

    if (updateDto.unidad_organizacional_id !== undefined) {
      const unidad = await this.unidadRepo.findOne({
        where: { id: updateDto.unidad_organizacional_id },
        relations: ['area'],
      });

      if (!unidad) throw new NotFoundException('Unidad Organizacional no encontrada');

      ambiente.unidad_organizacional = unidad;
      ambiente.unidad_organizacional_id = unidad.id;
    }

    return this.ambienteRepo.save(ambiente);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ambiente = await this.findOne(id);
    ambiente.estado = 'INACTIVO';
    await this.ambienteRepo.save(ambiente);
    return { message: 'Ambiente marcado como INACTIVO' };
  }

  async cambiarEstado(id: number, userId: number): Promise<Ambiente> {
    const ambiente = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) throw new NotFoundException('Usuario no válido');

    ambiente.estado = ambiente.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    ambiente.actualizado_por = usuario;
    ambiente.actualizado_por_id = userId;
    ambiente.updated_at = new Date();

    return this.ambienteRepo.save(ambiente);
  }

  async contarPorUnidad(unidadId: number): Promise<number> {
    return this.ambienteRepo.count({
      where: { unidad_organizacional_id: unidadId },
    });
  }

  async buscarPorUnidadYTexto(unidadId: number, texto: string): Promise<Ambiente[]> {
    return this.ambienteRepo.createQueryBuilder('ambiente')
      .where('ambiente.unidad_organizacional_id = :unidadId', { unidadId })
      .andWhere('ambiente.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('(LOWER(ambiente.descripcion) LIKE :texto OR LOWER(ambiente.codigo) LIKE :texto)', {
        texto: `%${texto.toLowerCase()}%`,
      })
      .orderBy('ambiente.codigo', 'ASC')
      .take(10)
      .getMany();
  }

}
