import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AmbientesService } from './ambientes.service';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/ambientes')
@UseGuards(JwtAuthGuard)
export class AmbientesController {
  constructor(private readonly ambientesService: AmbientesService) { }

  @Post()
  create(
    @Body() dto: CreateAmbienteDto,
    @Req() req: RequestWithUser,
  ) {
    return this.ambientesService.create({ ...dto, creado_por_id: req.user.id });
  }

  @Get()
  findAll(@Query('estado') estado: string) {
    return this.ambientesService.findAll(estado);
  }

  @Get('contar')
  async contarPorUnidad(
    @Query('unidad_id', ParseIntPipe) unidadId: number
  ) {
    if (!unidadId || isNaN(unidadId)) {
      throw new BadRequestException('unidad_id es requerido y debe ser numérico');
    }

    const total = await this.ambientesService.contarPorUnidad(unidadId);
    return { total };
  }

  @Get('buscar')
  async buscarAmbientes(
    @Query('unidad_organizacional_id', ParseIntPipe) unidadId: number,
    @Query('search') search: string,
  ) {
    if (!unidadId || !search) {
      throw new BadRequestException('unidad_organizacional_id y search son requeridos');
    }

    return this.ambientesService.buscarPorUnidadYTexto(unidadId, search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ambientesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAmbienteDto,
    @Req() req: RequestWithUser,
  ) {
    return this.ambientesService.update(id, updateDto, req.user.id);
  }



  @Put(':id/cambiar-estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.ambientesService.cambiarEstado(id, req.user.id);
  }

  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string,
  ) {
    try {
      const ambientes = await this.ambientesService.findAll(estado);

      const filasHTML = ambientes.map((ambiente, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${ambiente.unidad_organizacional?.area?.codigo || '—'}</td>
          <td>${ambiente.unidad_organizacional?.codigo || '—'}</td>
          <td>${ambiente.codigo}</td>
          <td>${ambiente.descripcion}</td>
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
        'ambientes-pdf.html',
      );

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ Plantilla PDF no encontrada:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_AMBIENTES -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=ambientes.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
