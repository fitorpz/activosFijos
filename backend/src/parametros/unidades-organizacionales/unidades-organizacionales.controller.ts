import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
  Res,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UnidadesOrganizacionalesService } from './unidades-organizacionales.service';
import { CreateUnidadOrganizacionalDto } from './dto/create-unidad-organizacional.dto';
import { UpdateUnidadOrganizacionalDto } from './dto/update-unidad-organizacional.dto';
import { UnidadOrganizacional } from './entities/unidad-organizacional.entity';
import { Area } from '../areas/entities/areas.entity';

import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';

import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/unidades-organizacionales')
@UseGuards(AuthGuard('jwt'))
export class UnidadesOrganizacionalesController {
  constructor(
    private readonly unidadesService: UnidadesOrganizacionalesService,

    @InjectRepository(Area)
    private readonly areasRepo: Repository<Area>,
  ) { }

  @Post()
  create(
    @Body() dto: CreateUnidadOrganizacionalDto,
    @Req() req: RequestWithUser,
  ) {
    dto.creado_por_id = req.user.id;
    return this.unidadesService.create(dto);
  }

  @Get()
  findAll(
    @Query('estado') estado: string,
    @Query('area_id') area_id?: number
  ) {
    return this.unidadesService.findAll(estado, area_id);
  }


  @Get('contar')
  async contarPorCodigoArea(@Query('codigo_area') codigoArea: string): Promise<{ total: number }> {
    if (!codigoArea) {
      throw new BadRequestException('El parámetro codigo_area es requerido');
    }

    const total = await this.unidadesService.contarPorCodigoArea(codigoArea);
    return { total };
  }

  @Get('buscar')
  async buscar(
    @Query('q') q: string,
    @Query('estado') estado?: string,
    @Query('area_id', ParseIntPipe) area_id?: number, // 👈 obligatorio numérico
  ) {
    return this.unidadesService.buscar({ q, estado, area_id });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unidadesService.findOne(id);
  }


  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadOrganizacionalDto,
    @Req() req: RequestWithUser,
  ) {
    dto.actualizado_por_id = req.user.id;
    return this.unidadesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unidadesService.remove(id);
  }

  @Patch(':id/restaurar')
  restaurar(@Param('id', ParseIntPipe) id: number) {
    return this.unidadesService.restaurar(id);
  }

  @Put(':id/cambiar-estado')
  cambiarEstadoUnidad(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.unidadesService.cambiarEstado(id, req.user.id);
  }

  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string,
  ) {
    try {
      const unidades = await this.unidadesService.findAll(estado);

      const filasHTML = unidades.map((unidad, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${unidad.area?.codigo || '—'}</td>
          <td>${unidad.codigo}</td>
          <td>${unidad.descripcion}</td>
        </tr>
      `).join('');

      const logoPath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'escudo.png');

        let logoDataURL = '';
        try {
          const logoBuffer = fs.readFileSync(logoPath);
          const logoBase64 = logoBuffer.toString('base64');
          logoDataURL = `data:image/png;base64,${logoBase64}`;
        } catch (e) {
          console.error('❌ No se pudo cargar el logo:', logoPath);
        }


      const templatePath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'unidades-organizacionales-pdf.html',
      );

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ Plantilla PDF no encontrada:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_UNIDADES -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=unidades-organizacionales.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
