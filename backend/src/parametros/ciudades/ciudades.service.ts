import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ciudad } from './entities/ciudades.entity';
import { CreateCiudadesDto } from './dto/create-ciudades.dto';
import { UpdateCiudadesDto } from './dto/update-ciudades.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class CiudadesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadRepo: Repository<Ciudad>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  async create(dto: CreateCiudadesDto, userId: number): Promise<Ciudad> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    const codigoNormalizado = dto.codigo.trim().toUpperCase();
    const existe = await this.ciudadRepo.findOneBy({ codigo: codigoNormalizado });
    if (existe) throw new Error(`Ya existe una ciudad con el código ${dto.codigo}`);

    const nueva = this.ciudadRepo.create({
      descripcion: dto.descripcion,
      codigo: codigoNormalizado,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.ciudadRepo.save(nueva);
  }
 async findAll(estado?: string): Promise<Ciudad[]> {
  const query = this.ciudadRepo.createQueryBuilder('ciudad')
    .leftJoinAndSelect('ciudad.creado_por', 'creado_por')
    .leftJoinAndSelect('ciudad.actualizado_por', 'actualizado_por')
    .orderBy('ciudad.descripcion', 'ASC');

  if (estado && estado !== 'todos') {
    query.where('ciudad.estado = :estado', { estado: estado.toUpperCase() });
  }

  return query.getMany();
}



  async findOne(id: number): Promise<Ciudad> {
    const ciudad = await this.ciudadRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!ciudad) throw new NotFoundException(`Ciudad con ID ${id} no encontrada`);
    return ciudad;
  }

  async update(id: number, dto: UpdateCiudadesDto, userId: number): Promise<Ciudad> {
    const ciudad = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    if (dto.codigo !== undefined) ciudad.codigo = dto.codigo;
    if (dto.descripcion !== undefined) ciudad.descripcion = dto.descripcion;

    ciudad.actualizado_por = usuario;

    return this.ciudadRepo.save(ciudad);
  }

  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const ciudad = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    ciudad.estado = ciudad.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    ciudad.actualizado_por = usuario;

    await this.ciudadRepo.save(ciudad);

    return {
      nuevoEstado: ciudad.estado,
      message: `Ciudad actualizada a estado ${ciudad.estado}`,
    };
  }
}
