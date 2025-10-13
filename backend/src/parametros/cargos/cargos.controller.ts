import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Cargo } from './entities/cargos.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCargosDto } from './dto/create-cargos.dto';
import { UpdateCargosDto } from './dto/update-cargos.dto';
import { CargosService } from './cargos.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';

@Controller('parametros/cargos')
@UseGuards(JwtAuthGuard)
export class CargosController {
  constructor(
    private readonly cargosService: CargosService,

    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) { }

  @Post()
  create(
    @Body() dto: CreateCargosDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.cargosService.create(dto, userId);
  }

  @Get()
  findAll(@Query('estado') estado?: 'ACTIVO' | 'INACTIVO') {
    return this.cargosService.findAll(estado);
  }

  // ✅ Búsqueda simple para módulo de cargos (por texto y ambiente)
  @Get('buscar')
  async buscarCargos(
    @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
    @Query('search') search: string,
  ) {
    // FILTRA por ambiente y texto en cargo o código, solo los activos
    return this.cargoRepository.find({
      where: [
        { ambiente_id, estado: 'ACTIVO', cargo: ILike(`%${search}%`) },
        { ambiente_id, estado: 'ACTIVO', codigo: ILike(`%${search}%`) },
      ],
      order: { codigo: 'ASC' },
      take: 10,
    });
  }


  // ✅ Búsqueda por ambiente para el módulo de edificios
  @Get('buscar-por-ambiente')
  async buscarCargosDesdeEdificio(
    @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
    @Query('q') q: string,
  ) {
    return this.cargosService.buscarPorAmbiente(ambiente_id, q);
  }

  // ✅ Generar siguiente código por ambiente
  @Get('siguiente-codigo')
  async siguienteCodigo(@Query('ambiente_codigo') ambienteCodigo: string) {
    if (!ambienteCodigo) {
      throw new Error('El parámetro ambiente_codigo es obligatorio');
    }

    return this.cargosService.generarCodigoPorAmbiente(ambienteCodigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cargosService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCargosDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.cargosService.update(id, dto, userId);
  }


  @Put(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: 'ACTIVO' | 'INACTIVO',
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.cargosService.cambiarEstado(id, estado, userId);
  }
}
