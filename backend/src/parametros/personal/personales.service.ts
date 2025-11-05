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

  async create(dto: CreatePersonalesDto, userId: number): Promise<Personal> {
    const usuarioSistema = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuarioSistema) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // 🔍 Buscar el usuario asignado al nuevo personal
    const usuarioAsignado = await this.usuarioRepo.findOneBy({ id: dto.usuario_id });
    if (!usuarioAsignado) {
      throw new NotFoundException(`Usuario con ID ${dto.usuario_id} no encontrado para asignar a personal`);
    }

    const nuevoPersonal = this.direccionRepo.create({
      expedido: dto.expedido,
      ci: dto.ci,
      nombre: dto.nombre,
      profesion: dto.profesion,
      direccion: dto.direccion,
      celular: dto.celular,
      telefono: dto.telefono,
      email: dto.email,
      fecnac: dto.fecnac,
      estciv: dto.estciv,
      sexo: dto.sexo,
      estado: 'ACTIVO',
      creado_por: usuarioSistema,
      usuario: usuarioAsignado,
      usuario_id: dto.usuario_id,
    });

    return await this.direccionRepo.save(nuevoPersonal);
  }


  async findAll(): Promise<Personal[]> {
    return this.direccionRepo.find({
      relations: ['creado_por', 'actualizado_por', 'usuario'],
    });
  }

  async findOne(id: number): Promise<Personal> {
    const personal = await this.direccionRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por', 'usuario'],
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    return personal;
  }

  async update(id: number, dto: UpdatePersonalesDto, userId: number): Promise<Personal> {
    const personal = await this.direccionRepo.findOneBy({ id });
    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    await this.direccionRepo.update(id, {
      expedido: dto.expedido,
      ci: dto.ci,
      nombre: dto.nombre,
      profesion: dto.profesion,
      direccion: dto.direccion,
      celular: dto.celular,
      telefono: dto.telefono,
      email: dto.email,
      fecnac: dto.fecnac,
      estciv: dto.estciv,
      sexo: dto.sexo,
      actualizado_por: usuario,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const personal = await this.direccionRepo.findOneBy({ id });
    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    await this.direccionRepo.softDelete(id);
  }

  async obtenerUsuariosDisponibles(): Promise<Usuario[]> {
    const usuariosConPersonal = await this.direccionRepo
      .createQueryBuilder('personal')
      .select('personal.usuario_id', 'id')
      .where('personal.usuario_id IS NOT NULL')
      .getRawMany();

    const idsOcupados = usuariosConPersonal.map((row) => row.id);

    const query = this.usuarioRepo.createQueryBuilder('usuario');

    if (idsOcupados.length > 0) {
      query.where('usuario.id NOT IN (:...ids)', { ids: idsOcupados });
    }

    return query.getMany();
  }


  async cambiarEstado(id: number, userId: number): Promise<Personal> {
    const personal = await this.direccionRepo.findOneBy({ id });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    const nuevoEstado = personal.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    await this.direccionRepo.update(id, {
      estado: nuevoEstado,
      actualizado_por: usuario,
    });

    return this.findOne(id);
  }

}
