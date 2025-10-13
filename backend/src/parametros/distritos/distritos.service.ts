import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distrito } from './entities/distritos.entity';
import { CreateDistritosDto } from './dto/create-distritos.dto';
import { UpdateDistritosDto } from './dto/update-distritos.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ILike } from 'typeorm';


@Injectable()
export class DistritosService {
  constructor(
    @InjectRepository(Distrito)
    private readonly distritoRepo: Repository<Distrito>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  async create(dto: CreateDistritosDto, userId: number): Promise<Distrito> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    const codigoNormalizado = dto.codigo.trim().toUpperCase();
    const existe = await this.distritoRepo.findOneBy({ codigo: codigoNormalizado });
    if (existe) throw new Error(`Ya existe un distrito con el código ${dto.codigo}`);

    const nueva = this.distritoRepo.create({
      descripcion: dto.descripcion,
      codigo: codigoNormalizado,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.distritoRepo.save(nueva);
  }

async findAll(estado?: string): Promise<Distrito[]> {
  const where = estado && estado !== 'todos'
    ? { estado: estado.toUpperCase() as 'ACTIVO' | 'INACTIVO' }
    : {};

  return this.distritoRepo.find({
    where,
    relations: ['creado_por', 'actualizado_por'],
    order: {
      descripcion: 'ASC',
    },
  });
}


  async findOne(id: number): Promise<Distrito> {
    const distrito = await this.distritoRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!distrito) throw new NotFoundException(`Distrito con ID ${id} no encontrada`);
    return distrito;
  }

  async update(id: number, dto: UpdateDistritosDto, userId: number): Promise<Distrito> {
    const distrito = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    if (dto.codigo !== undefined) distrito.codigo = dto.codigo;
    if (dto.descripcion !== undefined) distrito.descripcion = dto.descripcion;

    distrito.actualizado_por = usuario;

    return this.distritoRepo.save(distrito);
  }

  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const ciudad = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    ciudad.estado = ciudad.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    ciudad.actualizado_por = usuario;

    await this.distritoRepo.save(ciudad);

    return {
      nuevoEstado: ciudad.estado,
      message: `Ciudad actualizada a estado ${ciudad.estado}`,
    };
  }

  async buscarPorNombre(q: string): Promise<Distrito[]> {
    return this.distritoRepo.find({
      where: {
        descripcion: ILike(`%${q}%`),
      },
      take: 10,
    });
  }


}
