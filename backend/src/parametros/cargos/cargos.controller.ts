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

  @Put(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.cargosService.cambiarEstado(id, estado, userId);
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

      // 🔹 Obtener cargos filtrados por estado
      const cargos = await this.cargosService.findAll(estado);

      if (!cargos.length) {
        return res.status(404).json({ message: 'No hay cargos para exportar' });
      }

      // 🔹 Ordenar por área, unidad organizacional, ambiente y código
      cargos.sort((a, b) => {
        const area = a.area.localeCompare(b.area);
        if (area !== 0) return area;

        const unidad = a.unidad_organizacional.localeCompare(b.unidad_organizacional);
        if (unidad !== 0) return unidad;

        const ambiente = a.ambiente.localeCompare(b.ambiente);
        if (ambiente !== 0) return ambiente;

        return a.codigo.localeCompare(b.codigo);
      });

      // 🔹 Agrupar jerárquicamente
      const agrupado = cargos.reduce((acc, cargo) => {
        if (!acc[cargo.area]) acc[cargo.area] = {};
        if (!acc[cargo.area][cargo.unidad_organizacional])
          acc[cargo.area][cargo.unidad_organizacional] = {};
        if (!acc[cargo.area][cargo.unidad_organizacional][cargo.ambiente])
          acc[cargo.area][cargo.unidad_organizacional][cargo.ambiente] = [];

        acc[cargo.area][cargo.unidad_organizacional][cargo.ambiente].push(cargo);
        return acc;
      }, {} as Record<string, Record<string, Record<string, any[]>>>);

      // 🔹 Construir HTML agrupado
      let filasHTML = '';
      let contador = 1;

      for (const [area, unidades] of Object.entries(agrupado)) {
        filasHTML += `
        <tr>
          <td colspan="7" style="background:#cfe2ff;font-weight:bold;font-size:14px;">
            Área: ${area}
          </td>
        </tr>
      `;

        for (const [unidad, ambientes] of Object.entries(unidades)) {
          filasHTML += `
          <tr>
            <td colspan="7" style="background:#e2e3e5;font-weight:bold;padding-left:20px;font-size:13px;">
              Unidad Organizacional: ${unidad}
            </td>
          </tr>
        `;

          for (const [ambiente, listaCargos] of Object.entries(ambientes)) {
            filasHTML += `
            <tr>
              <td colspan="7" style="background:#f8f9fa;font-weight:bold;padding-left:40px;font-size:12.5px;">
                Ambiente: ${ambiente}
              </td>
            </tr>
          `;

            listaCargos.forEach((cargo) => {
              filasHTML += `
              <tr>
                <td>${contador++}</td>                
                <td>${cargo.codigo}</td>
                <td>${cargo.cargo || ''}</td>
                <td>${cargo.estado}</td>
              </tr>
            `;
            });
          }
        }
      }

      // 🔹 Cargar logo y plantilla HTML
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

      // 🔹 Generar PDF
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
