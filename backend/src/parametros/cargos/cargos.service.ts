import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Cargo } from './entities/cargos.entity';
import { CreateCargosDto } from './dto/create-cargos.dto';
import { UpdateCargosDto } from './dto/update-cargos.dto';
import { Usuario } from '../../usuarios/entities/usuario.entity';


@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) { }

  // Crear un nuevo cargo
  async create(dto: CreateCargosDto, userId: number): Promise<Cargo> {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const nuevoCargo = this.cargoRepository.create({
      ...dto,
      creado_por: usuario,
    });

    return this.cargoRepository.save(nuevoCargo);
  }

  // Obtener todos los cargos
  async findAll(estado?: 'ACTIVO' | 'INACTIVO'): Promise<Cargo[]> {
    const where = estado ? { estado } : {};
    return this.cargoRepository.find({
      where,
      order: { id: 'DESC' },
      relations: ['creado_por', 'actualizado_por'],
    });
  }

  // Obtener un cargo por ID
  async findOne(id: number): Promise<Cargo> {
    const cargo = await this.cargoRepository.findOne({
      where: { id },
      relations: ['creado_por', 'actualizado_por'],
    });

    if (!cargo) {
      throw new NotFoundException(`Cargo ${id} no encontrado`);
    }

    return cargo;
  }

  // Actualizar un cargo
  // Actualizar un cargo
  // En tu service CargosService

  async update(id: number, dto: UpdateCargosDto, userId: number): Promise<Cargo> {
    const cargo = await this.findOne(id);
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    // 👇 ESTA PARTE FALTABA en muchos casos
    if (dto.ambiente_id !== undefined && dto.ambiente_id !== null) {
      cargo.ambiente_id = dto.ambiente_id;
    }

    if (dto.area !== undefined) cargo.area = dto.area;
    if (dto.unidad_organizacional !== undefined) cargo.unidad_organizacional = dto.unidad_organizacional;
    if (dto.estado !== undefined) cargo.estado = dto.estado;
    if (dto.ambiente !== undefined) cargo.ambiente = dto.ambiente;
    if (dto.codigo !== undefined) cargo.codigo = dto.codigo;
    if (dto.cargo !== undefined) cargo.cargo = dto.cargo;
    if (dto.personal1 !== undefined) cargo.personal1 = dto.personal1;
    if (dto.personal2 !== undefined) cargo.personal2 = dto.personal2;
    if (dto.personal3 !== undefined) cargo.personal3 = dto.personal3;

    cargo.actualizado_por = usuario;

    return this.cargoRepository.save(cargo);
  }




  // Cambiar estado ACTIVO/INACTIVO
  async cambiarEstado(id: number, estado: 'ACTIVO' | 'INACTIVO', userId: number): Promise<Cargo> {
    const cargo = await this.findOne(id);

    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException(`Usuario ${userId} no encontrado`);

    cargo.estado = estado;
    cargo.actualizado_por = usuario;

    return this.cargoRepository.save(cargo);
  }

  // Generar código automático por ambiente
  async generarCodigoPorAmbiente(ambienteCodigo: string): Promise<{ codigo: string }> {
    const total = await this.cargoRepository
      .createQueryBuilder('cargo')
      .where('cargo.ambiente = :ambienteCodigo', { ambienteCodigo })
      .getCount();

    const correlativo = (total + 1).toString().padStart(2, '0');
    const codigoFinal = `${ambienteCodigo}.${correlativo}`;

    return { codigo: codigoFinal };
  }

  // Buscar cargos por ambiente_id y texto
  async buscarPorAmbiente(ambiente_id: number, q: string): Promise<Cargo[]> {
    const resultados = await this.cargoRepository.find({
      where: {
        ambiente_id,
        estado: 'ACTIVO',
        cargo: ILike(`%${q}%`)
      },
      order: { codigo: 'ASC' }
    });

    console.log('📦 Cargos encontrados:', resultados);
    return resultados;
  }
}
