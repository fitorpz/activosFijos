import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/areas.entity';
import { CreateAreasDto } from './dto/create-areas.dto';
import { UpdateAreasDto } from './dto/update-areas.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly direccionRepo: Repository<Area>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  async existeCodigo(codigo: string): Promise<boolean> {
    const existente = await this.direccionRepo.findOne({ where: { codigo } });
    return !!existente;
  }

  // Crear una nueva area
  async create(dto: CreateAreasDto, userId: number): Promise<Area> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // ✅ Verifica si ya existe un área con el mismo código
    const yaExiste = await this.direccionRepo.findOne({ where: { codigo: dto.codigo } });
    if (yaExiste) {
      throw new BadRequestException(`Ya existe un área con el código '${dto.codigo}'`);
    }

    const nuevaArea = this.direccionRepo.create({
      ...dto,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.direccionRepo.save(nuevaArea);
  }

  // Obtener todas las direcciones
  // areas.service.ts
  async findAll(estado?: string): Promise<Area[]> {
    const query = this.direccionRepo.createQueryBuilder('area')
      .leftJoinAndSelect('area.creado_por', 'creado_por')
      .leftJoinAndSelect('area.actualizado_por', 'actualizado_por') // 👈 FALTA ESTO
      .orderBy('area.id', 'DESC');

    if (estado && estado !== 'todos') {
      query.andWhere('area.estado = :estado', { estado: estado.toUpperCase() });
    }


    return query.getMany();
  }



  // Obtener una sola dirección por ID
  async findOne(id: number): Promise<Area> {
    const direccion = await this.direccionRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!direccion) {
      throw new NotFoundException(`Area ${id} no encontrada`);
    }

    return direccion;
  }

  // Actualizar una dirección
  async update(
    id: number,
    dto: UpdateAreasDto,
    userId: number,
  ): Promise<Area> {
    const area = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // ✅ Si se cambió el código, verificar que no exista en otra área
    if (dto.codigo && dto.codigo !== area.codigo) {
      const existente = await this.direccionRepo.findOne({
        where: { codigo: dto.codigo },
      });

      if (existente && existente.id !== id) {
        throw new BadRequestException(
          `Ya existe un área con el código '${dto.codigo}'`
        );
      }

      area.codigo = dto.codigo;
    }

    if (dto.descripcion !== undefined) {
      area.descripcion = dto.descripcion;
    }

    if (dto.estado !== undefined) {
      area.estado = dto.estado;
    }

    area.actualizado_por = usuario;

    return this.direccionRepo.save(area);
  }


  // Eliminar (soft delete)
  async remove(id: number): Promise<{ message: string }> {
    const area = await this.direccionRepo.findOne({ where: { id } });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    area.estado = 'INACTIVO'; // o 'ACTIVO' si deseas volver a activar
    await this.direccionRepo.save(area);

    return { message: 'Área marcada como INACTIVA' };
  }
  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const area = await this.direccionRepo.findOne({ where: { id } });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    area.estado = area.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    area.actualizado_por = usuario;

    await this.direccionRepo.save(area);

    return {
      nuevoEstado: area.estado,
      message: `Área actualizada a estado ${area.estado}`,
    };
  }
}
