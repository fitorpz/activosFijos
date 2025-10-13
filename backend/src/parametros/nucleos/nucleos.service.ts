import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nucleo } from './entities/nucleos.entity';
import { CreateNucleosDto } from './dto/create-nucleos.dto';
import { UpdateNucleosDto } from './dto/update-nucleos.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class NucleosService {
  constructor(
    @InjectRepository(Nucleo)
    private readonly direccionRepo: Repository<Nucleo>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  // Crear una nueva area
  async create(dto: CreateNucleosDto, userId: number): Promise<Nucleo> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    const codigoNormalizado = dto.codigo.trim().toUpperCase();

    const existe = await this.direccionRepo.findOneBy({ codigo: codigoNormalizado });
    if (existe) throw new Error(`Ya existe un núcleo con el código ${dto.codigo}`);

    const nuevo = this.direccionRepo.create({
      descripcion: dto.descripcion,
      codigo: codigoNormalizado,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.direccionRepo.save(nuevo);
  }

  // Obtener todas las direcciones
  async findAll(estado?: string): Promise<Nucleo[]> {
    const query = this.direccionRepo.createQueryBuilder('nucleo')
      .leftJoinAndSelect('nucleo.creado_por', 'creado_por')
      .leftJoinAndSelect('nucleo.actualizado_por', 'actualizado_por')
      .orderBy('nucleo.codigo', 'ASC');

    if (estado && estado !== 'todos') {
      query.andWhere('nucleo.estado = :estado', { estado: estado.toUpperCase() });
    }

    return query.getMany();
  }

  // Obtener una sola dirección por ID
  async findOne(id: number): Promise<Nucleo> {
    const direccion = await this.direccionRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!direccion) {
      throw new NotFoundException(`Nucleo ${id} no encontrada`);
    }

    return direccion;
  }

  // Actualizar una dirección
  async update(
    id: number,
    dto: UpdateNucleosDto,
    userId: number,
  ): Promise<Nucleo> {
    const direccion = await this.findOne(id);

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (dto.codigo !== undefined) {
      direccion.codigo = dto.codigo;
    }

    if (dto.descripcion !== undefined) {
      direccion.descripcion = dto.descripcion;
    }

    direccion.actualizado_por = usuario;


    return this.direccionRepo.save(direccion);
  }

  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const nucleo = await this.direccionRepo.findOne({ where: { id } });
    if (!nucleo) throw new NotFoundException('Núcleo no encontrado');

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    nucleo.estado = nucleo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    nucleo.actualizado_por = usuario;

    await this.direccionRepo.save(nucleo);

    return {
      nuevoEstado: nucleo.estado,
      message: `Núcleo actualizado a estado ${nucleo.estado}`,
    };
  }

}
