import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionAdministrativa } from './entities/direcciones-administrativas.entity';
import { CreateDireccionesAdministrativasDto } from './dto/create-direcciones-administrativa.dto';
import { UpdateDireccionesAdministrativasDto } from './dto/update-direcciones-administrativa.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class DireccionesAdministrativasService {
  constructor(
    @InjectRepository(DireccionAdministrativa)
    private readonly direccionRepo: Repository<DireccionAdministrativa>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  async create(dto: CreateDireccionesAdministrativasDto, userId: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const codigoNormalizado = dto.codigo.trim().toUpperCase();

    const existe = await this.direccionRepo.findOneBy({ codigo: codigoNormalizado });
    if (existe) {
      throw new Error(`Ya existe una Dirección Administrativa con el código ${dto.codigo}`);
    }

    const nuevaDireccion = this.direccionRepo.create({
      ...dto,
      codigo: codigoNormalizado, // <-- Se guarda en mayúsculas
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.direccionRepo.save(nuevaDireccion);
  }



  async findAll(estado?: string): Promise<DireccionAdministrativa[]> {
    const query = this.direccionRepo.createQueryBuilder('direccion')
      .leftJoinAndSelect('direccion.creado_por', 'creado_por')
      .leftJoinAndSelect('direccion.actualizado_por', 'actualizado_por')
      .orderBy('direccion.id', 'DESC');

    if (estado && estado !== 'todos') {
      query.andWhere('direccion.estado = :estado', { estado: estado.toUpperCase() });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<DireccionAdministrativa> {
    const direccion = await this.direccionRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!direccion) {
      throw new NotFoundException(`Dirección ${id} no encontrada`);
    }

    return direccion;
  }

  async update(id: number, dto: UpdateDireccionesAdministrativasDto, userId: number) {
    const direccion = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (dto.codigo !== undefined) direccion.codigo = dto.codigo;
    if (dto.descripcion !== undefined) direccion.descripcion = dto.descripcion;
    if (dto.estado !== undefined) direccion.estado = dto.estado;

    direccion.actualizado_por = usuario;

    return this.direccionRepo.save(direccion);
  }

  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const direccion = await this.direccionRepo.findOne({ where: { id } });

    if (!direccion) throw new NotFoundException('Dirección no encontrada');

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    direccion.estado = direccion.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    direccion.actualizado_por = usuario;

    await this.direccionRepo.save(direccion);

    return {
      nuevoEstado: direccion.estado,
      message: `Dirección actualizada a estado ${direccion.estado}`,
    };
  }
}

