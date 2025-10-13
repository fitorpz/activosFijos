import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from './entities/personales.entity';
import { CreatePersonalesDto } from './dto/create-personales.dto';
import { UpdatePersonalesDto } from './dto/update-personales.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class PersonalesService {
  constructor(
    @InjectRepository(Personal)
    private readonly direccionRepo: Repository<Personal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  // Crear una nueva area
  async create(
    dto: CreatePersonalesDto,
    userId: number,
  ): Promise<Personal> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const nuevaDireccion = this.direccionRepo.create({
      ...dto,
      creado_por: usuario,
    });

    return this.direccionRepo.save(nuevaDireccion);
  }

  // Obtener todas las direcciones
  async findAll(): Promise<Personal[]> {
    return this.direccionRepo.find({
      order: { id: 'DESC' },
      relations: ['creado_por', 'actualizado_por'],
    });
  }

  // Obtener una sola dirección por ID
  async findOne(id: number): Promise<Personal> {
    const direccion = await this.direccionRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!direccion) {
      throw new NotFoundException(`PErsonal ${id} no encontrado`);
    }

    return direccion;
  }

  // Actualizar una dirección
  async update(
    id: number,
    dto: UpdatePersonalesDto,
    userId: number,
  ): Promise<Personal> {
    const direccion = await this.findOne(id);

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (dto.documento !== undefined) {
      direccion.documento = dto.documento;
    }

    if (dto.ci !== undefined) {
      direccion.ci = dto.ci;
    }

    if (dto.nombre !== undefined) {
      direccion.nombre = dto.nombre;
    }

    if (dto.estado !== undefined) {
      direccion.estado = dto.estado;
    }

    if (dto.expedido !== undefined) {
      direccion.expedido = dto.expedido;
    }

    if (dto.profesion !== undefined) {
      direccion.profesion = dto.profesion;
    }

    if (dto.direccion !== undefined) {
      direccion.direccion = dto.direccion;
    }

    if (dto.celular !== undefined) {
      direccion.celular = dto.celular;
    }

    if (dto.telefono !== undefined) {
      direccion.telefono = dto.telefono;
    }

    if (dto.email !== undefined) {
      direccion.email = dto.email;
    }

    if (dto.fecnac !== undefined) {
      direccion.fecnac = dto.fecnac;
    }

    if (dto.estciv !== undefined) {
      direccion.estciv = dto.estciv;
    }

    if (dto.sexo !== undefined) {
      direccion.sexo = dto.sexo;
    }

    direccion.actualizado_por = usuario;


    return this.direccionRepo.save(direccion);
  }
  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const personal = await this.direccionRepo.findOne({ where: { id } });

    if (!personal) throw new NotFoundException('Personal no encontrado');

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    personal.estado = personal.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    personal.actualizado_por = usuario;

    await this.direccionRepo.save(personal);

    return {
      nuevoEstado: personal.estado,
      message: `Personal actualizado a estado ${personal.estado}`,
    };
  }

}
