import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Res,
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
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/cargos')
@UseGuards(JwtAuthGuard)
export class CargosController {
  constructor(
    private readonly cargosService: CargosService,
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) { }

  @Post()
  create(@Body() dto: CreateCargosDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.cargosService.create(dto, userId);
  }

  @Get()
  findAll(@Query('estado') estado?: 'ACTIVO' | 'INACTIVO') {
    return this.cargosService.findAll(estado);
  }

  @Get('buscar')
  async buscarCargos(
    @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
    @Query('search') search: string,
  ) {
    return this.cargoRepository.find({
      where: [
        { ambiente_id, estado: 'ACTIVO', cargo: ILike(`%${search}%`) },
        { ambiente_id, estado: 'ACTIVO', codigo: ILike(`%${search}%`) },
      ],
      order: { codigo: 'ASC' },
      take: 10,
    });
  }

  @Get('buscar-por-ambiente')
  async buscarCargosDesdeEdificio(
    @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
    @Query('q') q: string,
  ) {
    return this.cargosService.buscarPorAmbiente(ambiente_id, q);
  }

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

  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estadoQuery?: string,
  ) {
    try {
      const estado =
        estadoQuery?.toUpperCase() === 'ACTIVO'
          ? 'ACTIVO'
          : estadoQuery?.toUpperCase() === 'INACTIVO'
            ? 'INACTIVO'
            : undefined;

      const cargos = await this.cargosService.findAll(estado);

      const filasHTML = cargos
        .map(
          (cargo, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${cargo.area}</td>
            <td>${cargo.unidad_organizacional}</td>    
            <td>${cargo.ambiente}</td>
            <td>${cargo.codigo}</td>
            <td>${cargo.cargo || ''}</td>    
            <td>${cargo.estado}</td>    
          </tr>
        `,
        )
        .join('');

      const logoPath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'escudo.png',
      );

      let logoDataURL = '';
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataURL = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      } catch (e) {
        console.error('No se pudo cargar el logo:', logoPath);
      }

      const templatePath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'cargos-pdf.html',
      );

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('Plantilla PDF no encontrada:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_CARGOS -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);
      html = html.replace(
        '__FILTRO_ESTADO__',
        estado ? `Mostrando cargos ${estado.toLowerCase()}` : 'Todos los cargos',
      );

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=cargos.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
