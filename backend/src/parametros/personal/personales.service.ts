import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    private readonly personalRepo: Repository<Personal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  // 🟢 Crear nuevo Personal
  async create(dto: CreatePersonalesDto, userId: number): Promise<Personal> {
    const usuarioCreador = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuarioCreador) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Validar si el usuario seleccionado ya fue asignado
    if (dto.usuario_id) {
      const existe = await this.personalRepo.findOne({
        where: { usuario: { id: dto.usuario_id } },
        relations: ['usuario'],
      });
      if (existe) {
        throw new BadRequestException(
          `El usuario seleccionado ya está asignado a otro personal.`,
        );
      }
    }

    // Buscar el usuario a asignar (si hay)
    const usuarioAsociado = dto.usuario_id
      ? await this.usuarioRepo.findOneBy({ id: dto.usuario_id })
      : undefined;

    const nuevoPersonal = this.personalRepo.create({
      ...dto,
      usuario: usuarioAsociado ?? undefined,
      creado_por: usuarioCreador,
    });

    return this.personalRepo.save(nuevoPersonal);
  }


  // 🟡 Obtener todos los personales
  async findAll(): Promise<Personal[]> {
    return this.personalRepo.find({
      order: { id: 'DESC' },
      relations: ['creado_por', 'actualizado_por', 'usuario'],
    });
  }

  // 🔍 Obtener un solo personal
  async findOne(id: number): Promise<Personal> {
    const personal = await this.personalRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por', 'usuario'],
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    return personal;
  }

  async update(id: number, dto: UpdatePersonalesDto, userId: number): Promise<Personal> {
    const personal = await this.findOne(id);
    const usuarioActualizador = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuarioActualizador) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Validar reasignación de usuario
    if (dto.usuario_id && dto.usuario_id !== personal.usuario?.id) {
      const yaAsignado = await this.personalRepo.findOne({
        where: { usuario: { id: dto.usuario_id } },
        relations: ['usuario'],
      });

      if (yaAsignado) {
        throw new BadRequestException(`El usuario seleccionado ya está asignado a otro personal.`);
      }

      const nuevoUsuario = await this.usuarioRepo.findOneBy({ id: dto.usuario_id });
      personal.usuario = nuevoUsuario ?? undefined; // ✅ evitar null
    }

    // Actualizar otros campos
    personal.documento = dto.documento ?? personal.documento;
    personal.ci = dto.ci ?? personal.ci;
    personal.nombre = dto.nombre ?? personal.nombre;
    personal.estado = dto.estado ?? personal.estado;
    personal.expedido = dto.expedido ?? personal.expedido;
    personal.profesion = dto.profesion ?? personal.profesion;
    personal.direccion = dto.direccion ?? personal.direccion;
    personal.celular = dto.celular ?? personal.celular;
    personal.telefono = dto.telefono ?? personal.telefono;
    personal.email = dto.email ?? personal.email;
    personal.fecnac = dto.fecnac ?? personal.fecnac;
    personal.estciv = dto.estciv ?? personal.estciv;
    personal.sexo = dto.sexo ?? personal.sexo;
    personal.actualizado_por = usuarioActualizador;

    return this.personalRepo.save(personal);
  }


  // 🔁 Cambiar estado ACTIVO/INACTIVO
  async cambiarEstado(
    id: number,
    userId: number,
  ): Promise<{ nuevoEstado: string; message: string }> {
    const personal = await this.personalRepo.findOne({
      where: { id },
      relations: ['actualizado_por'],
    });

    if (!personal) throw new NotFoundException('Personal no encontrado');

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    personal.estado = personal.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    personal.actualizado_por = usuario;

    await this.personalRepo.save(personal);

    return {
      nuevoEstado: personal.estado,
      message: `Personal actualizado a estado ${personal.estado}`,
    };
  }

  // 🧩 Nuevo: Obtener usuarios disponibles (no asignados a personal)
  async obtenerUsuariosDisponibles(): Promise<Usuario[]> {
    const personales = await this.personalRepo.find({ relations: ['usuario'] });
    const usados = personales
      .map((p) => p.usuario?.id)
      .filter((id): id is number => !!id);

    const todosUsuarios = await this.usuarioRepo.find();
    const disponibles = todosUsuarios.filter((u) => !usados.includes(u.id));

    return disponibles;
  }
}
