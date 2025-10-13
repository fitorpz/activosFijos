import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoContable } from './entities/grupos-contables.entity';
import { CreateGruposContablesDto } from './dto/create-grupos-contables.dto';
import { UpdateGruposContablesDto } from './dto/update-grupos-contables.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class GruposContablesService {
  constructor(
    @InjectRepository(GrupoContable)
    private readonly grupoRepo: Repository<GrupoContable>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  // Crear nuevo grupo contable con generación automática de subgrupo si el código ya existe
  async create(dto: CreateGruposContablesDto, userId: number): Promise<GrupoContable> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const codigoFinal = await this.generarCodigoDisponible(dto.codigo.trim());

    const nuevoGrupo = this.grupoRepo.create({
      ...dto,
      codigo: codigoFinal,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.grupoRepo.save(nuevoGrupo);
  }

  // Genera un código disponible. Si ya existe el base, genera el siguiente subgrupo: 125.01, 125.02, etc.
  private async generarCodigoDisponible(codigoBase: string): Promise<string> {
    const base = codigoBase.split('.')[0];

    const existentes = await this.grupoRepo.createQueryBuilder('g')
      .select(['g.codigo'])
      .where('g.codigo = :base OR g.codigo LIKE :like', {
        base,
        like: `${base}.%`,
      })
      .getMany();

    const codigos = new Set(existentes.map(e => e.codigo));

    // Si el base no existe y el usuario no está enviando un subgrupo, se respeta el código
    if (!codigoBase.includes('.') && !codigos.has(codigoBase)) {
      return codigoBase;
    }

    // Si el usuario envió subgrupo y no existe aún, se respeta
    if (codigoBase.includes('.') && !codigos.has(codigoBase)) {
      return codigoBase;
    }

    // Generar el siguiente subgrupo disponible: base.01, base.02, ...
    let max = 0;
    for (const codigo of codigos) {
      if (codigo === base) continue;

      const parte = codigo.substring(base.length + 1); // e.g. "01"
      const num = parseInt(parte, 10);
      if (!isNaN(num)) {
        max = Math.max(max, num);
      }
    }

    const siguiente = (max + 1).toString().padStart(2, '0');
    return `${base}.${siguiente}`;
  }



  // Obtener todos los grupos contables (filtrables por estado)
  async findAll(estado?: string): Promise<GrupoContable[]> {
    const query = this.grupoRepo.createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.creado_por', 'creado_por')
      .leftJoinAndSelect('grupo.actualizado_por', 'actualizado_por')
      .orderBy('grupo.id', 'DESC');

    if (estado && estado !== 'todos') {
      query.andWhere('grupo.estado = :estado', { estado: estado.toUpperCase() });
    }

    return query.getMany();
  }

  // Obtener uno por ID
  async findOne(id: number): Promise<GrupoContable> {
    const grupo = await this.grupoRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo Contable ${id} no encontrado`);
    }

    return grupo;
  }

  // Actualizar grupo contable
  async update(id: number, dto: UpdateGruposContablesDto, userId: number): Promise<GrupoContable> {
    const grupo = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (dto.codigo !== undefined) grupo.codigo = dto.codigo;
    if (dto.descripcion !== undefined) grupo.descripcion = dto.descripcion;
    if (dto.tiempo !== undefined) grupo.tiempo = dto.tiempo;
    if (dto.porcentaje !== undefined) grupo.porcentaje = dto.porcentaje;
    if (dto.estado !== undefined) grupo.estado = dto.estado;

    grupo.actualizado_por = usuario;

    return this.grupoRepo.save(grupo);
  }

  // Cambiar estado ACTIVO/INACTIVO
  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const grupo = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    grupo.estado = grupo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    grupo.actualizado_por = usuario;

    await this.grupoRepo.save(grupo);

    return {
      nuevoEstado: grupo.estado,
      message: `Grupo Contable actualizado a estado ${grupo.estado}`,
    };
  }

  // Eliminar (lógica soft mediante cambio de estado)
  async remove(id: number): Promise<{ message: string }> {
    const grupo = await this.findOne(id);
    grupo.estado = 'INACTIVO';
    await this.grupoRepo.save(grupo);

    return { message: 'Grupo Contable marcado como INACTIVO' };
  }

  // Público: solo para sugerencia desde frontend
  async sugerirCodigoDisponible(codigoBase: string): Promise<string> {
    return this.generarCodigoDisponible(codigoBase.trim());
  }

}
