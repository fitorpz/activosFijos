import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Auxiliar } from './entities/auxiliares.entity';
import { CreateAuxiliaresDto } from './dto/create-auxiliares.dto';
import { UpdateAuxiliaresDto } from './dto/update-auxiliares.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class AuxiliaresService {
  constructor(
    @InjectRepository(Auxiliar)
    private readonly auxiliarRepo: Repository<Auxiliar>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  // Crear auxiliar
  async create(dto: CreateAuxiliaresDto, userId: number): Promise<Auxiliar> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    let nuevoCodigo = dto.codigo?.trim() || null;

    // 🔹 Generar automáticamente si no viene código o si ya existe
    let intento = 0;
    const maxIntentos = 10;

    do {
      if (!nuevoCodigo || await this.auxiliarRepo.findOne({ where: { codigo: nuevoCodigo } })) {
        nuevoCodigo = await this.getSiguienteCodigoAuxiliar(dto.codigo_grupo);
      } else {
        break; // código único encontrado
      }
      intento++;
    } while (intento < maxIntentos);

    if (intento >= maxIntentos) {
      throw new Error('No se pudo generar un código único de auxiliar después de varios intentos');
    }

    const nuevoAuxiliar = this.auxiliarRepo.create({
      ...dto,
      codigo: nuevoCodigo,
      estado: dto.estado ?? 'ACTIVO',
      creado_por: usuario,
    });

    return this.auxiliarRepo.save(nuevoAuxiliar);
  }

  // Obtener todos los auxiliares (con filtro por estado)
  // servicio
  async findAll(estado?: string, codigo_grupo?: string): Promise<Auxiliar[]> {
    const query = this.auxiliarRepo.createQueryBuilder('auxiliar')
      .leftJoinAndSelect('auxiliar.creado_por', 'creado_por')
      .leftJoinAndSelect('auxiliar.actualizado_por', 'actualizado_por');

    // estado
    if (estado && estado !== 'todos') {
      query.andWhere('auxiliar.estado = :estado', { estado: estado.toUpperCase() });
    }

    // grupo contable
    if (codigo_grupo) {
      query.andWhere('auxiliar.codigo_grupo = :codigo_grupo', { codigo_grupo });
    }

    return query.orderBy('auxiliar.codigo', 'ASC').getMany();
  }


  // Obtener auxiliar por ID
  async findOne(id: number): Promise<Auxiliar> {
    const auxiliar = await this.auxiliarRepo.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!auxiliar) {
      throw new NotFoundException(`Auxiliar ${id} no encontrado`);
    }

    return auxiliar;
  }

  // Actualizar auxiliar
  async update(
    id: number,
    dto: UpdateAuxiliaresDto,
    userId: number,
  ): Promise<Auxiliar> {
    const auxiliar = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (dto.codigo !== undefined) auxiliar.codigo = dto.codigo;
    if (dto.descripcion !== undefined) auxiliar.descripcion = dto.descripcion;
    if (dto.estado !== undefined) auxiliar.estado = dto.estado;
    if (dto.codigo_grupo !== undefined) auxiliar.codigo_grupo = dto.codigo_grupo;

    auxiliar.actualizado_por = usuario;

    return this.auxiliarRepo.save(auxiliar);
  }

  // Cambiar estado ACTIVO/INACTIVO
  async cambiarEstado(id: number, userId: number): Promise<{ nuevoEstado: string; message: string }> {
    const auxiliar = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    auxiliar.estado = auxiliar.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    auxiliar.actualizado_por = usuario;

    await this.auxiliarRepo.save(auxiliar);

    return {
      nuevoEstado: auxiliar.estado,
      message: `Auxiliar actualizado a estado ${auxiliar.estado}`,
    };
  }

  // Eliminar (lógica soft mediante estado)
  async remove(id: number): Promise<{ message: string }> {
    const auxiliar = await this.findOne(id);
    auxiliar.estado = 'INACTIVO';
    await this.auxiliarRepo.save(auxiliar);

    return { message: 'Auxiliar marcado como INACTIVO' };
  }

  async getSiguienteCodigoAuxiliar(codigo_grupo: string): Promise<string> {
    if (!codigo_grupo) throw new Error('Código de grupo contable obligatorio');

    const result = await this.auxiliarRepo
      .createQueryBuilder('a')
      .select(`
      MAX(
        CASE
          WHEN SPLIT_PART(a.codigo, '.', 2) ~ '^[0-9]+$'
          THEN CAST(SPLIT_PART(a.codigo, '.', 2) AS INTEGER)
          WHEN SPLIT_PART(a.codigo, '.', 3) ~ '^[0-9]+$'
          THEN CAST(SPLIT_PART(a.codigo, '.', 3) AS INTEGER)
          ELSE 0
        END
      )`, 'maximo')
      .where('a.codigo_grupo = :grupo', { grupo: codigo_grupo })
      .getRawOne<{ maximo: number }>();

    const ultimo = result?.maximo ?? 0;
    const siguiente = (ultimo + 1).toString().padStart(4, '0');

    return `${codigo_grupo}.${siguiente}`;
  }


  async buscarAuxiliares(search: string, estado?: string, codigo_grupo?: string): Promise<Auxiliar[]> {
    const query = this.auxiliarRepo.createQueryBuilder('auxiliar')
      .where('auxiliar.estado = :estado', { estado: (estado ?? 'ACTIVO').toUpperCase() });

    if (codigo_grupo) {
      query.andWhere('auxiliar.codigo_grupo = :codigo_grupo', { codigo_grupo });
    }

    if (search) {
      query.andWhere(
        '(auxiliar.codigo ILIKE :search OR auxiliar.descripcion ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return query.orderBy('auxiliar.codigo', 'ASC').limit(10).getMany();
  }

  async findByGrupo(codigo_grupo: string): Promise<Auxiliar[]> {
    return this.auxiliarRepo.find({
      where: { codigo_grupo, estado: 'ACTIVO' },
      order: { codigo: 'ASC' },
    });
  }
}