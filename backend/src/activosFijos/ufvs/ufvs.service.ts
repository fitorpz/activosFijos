import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ufv } from './entities/ufvs.entity';
import { CreateUfvsDto } from './dto/create-ufvs.dto';
import { UpdateUfvsDto } from './dto/update-ufvs.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class UfvsService {
  constructor(
    @InjectRepository(Ufv)
    private readonly ufvRepo: Repository<Ufv>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  async create(dto: CreateUfvsDto, userId: number): Promise<Ufv> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    //const codigoNormalizado = dto.fecha.trim().toUpperCase();
    const codigoNormalizado = dto.fecha;
    const existe = await this.ufvRepo.findOneBy({ fecha: codigoNormalizado });
    if (existe) throw new Error(`Ya existe una ufv con la fecha ${dto.fecha}`);

    const nueva = this.ufvRepo.create({
      tc: dto.tc,
      fecha: codigoNormalizado,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.ufvRepo.save(nueva);
  }

  async findAll(estado?: string): Promise<Ufv[]> {
    const query = this.ufvRepo.createQueryBuilder('ufv')
      .leftJoinAndSelect('ufv.creado_por', 'creado_por')
      .leftJoinAndSelect('ufv.actualizado_por', 'actualizado_por')
      .orderBy('ufv.id', 'DESC');

   // if (estado && estado !== 'todos') {
   //   query.andWhere('ufv.estado = :estado', { estado: estado.toUpperCase() });
   // }

//    return query.getMany();
 if (estado) {
    query.where('ufv.estado = :estado', { estado });
  }

  query.orderBy('ufv.fecha', 'ASC'); // Ordenar por fecha descendente

  return await query.getMany();
}
 // }

  async findOne(id: number): Promise<Ufv> {
    const ufv = await this.ufvRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!ufv) throw new NotFoundException(`Ufv con ID ${id} no encontrada`);
    return ufv;
  }

  async update(id: number, dto: UpdateUfvsDto, userId: number): Promise<Ufv> {
    const ufv = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    if (dto.fecha !== undefined) ufv.fecha = dto.fecha;
    if (dto.tc !== undefined) ufv.tc = dto.tc;

    ufv.actualizado_por = usuario;

    return this.ufvRepo.save(ufv);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ufv = await this.ufvRepo.findOneBy({ id });

    if (!ufv) {
      throw new NotFoundException(`Ufv con ID ${id} no encontrada`);
    }

    await this.ufvRepo.remove(ufv);

    return { message: `Ufv con ID ${id} eliminada correctamente` };
  }

  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const ufv = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    ufv.estado = ufv.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    ufv.actualizado_por = usuario;

    await this.ufvRepo.save(ufv);

    return {
      nuevoEstado: ufv.estado,
      message: `Ufv actualizada a estado ${ufv.estado}`,
    };
  }
}
