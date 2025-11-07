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

      // 1️⃣ Ordenar por área, unidad organizacional y luego por código
      ambientes.sort((a, b) => {
        const areaA = a.unidad_organizacional?.area?.codigo || '';
        const areaB = b.unidad_organizacional?.area?.codigo || '';
        const unidadA = a.unidad_organizacional?.codigo || '';
        const unidadB = b.unidad_organizacional?.codigo || '';
        const codigoA = a.codigo || '';
        const codigoB = b.codigo || '';

        if (areaA !== areaB) return areaA.localeCompare(areaB);
        if (unidadA !== unidadB) return unidadA.localeCompare(unidadB);
        return codigoA.localeCompare(codigoB);
      });

      // 2️⃣ Agrupar por área y unidad organizacional
      const agrupadoPorArea: Record<string, Record<string, any[]>> = {};

      for (const ambiente of ambientes) {
        const area = ambiente.unidad_organizacional?.area?.codigo || 'SIN ÁREA';
        const unidad = ambiente.unidad_organizacional?.codigo || 'SIN UO';
        if (!agrupadoPorArea[area]) agrupadoPorArea[area] = {};
        if (!agrupadoPorArea[area][unidad]) agrupadoPorArea[area][unidad] = [];
        agrupadoPorArea[area][unidad].push(ambiente);
      }

      // 3️⃣ Construir el HTML de filas agrupadas
      let filasHTML = '';
      let index = 1;

      for (const [areaCodigo, unidades] of Object.entries(agrupadoPorArea)) {
        // 👉 Tomar la descripción del área (de la primera unidad del grupo)
        const primeraUnidad = Object.values(unidades)[0]?.[0];
        const descripcionArea = primeraUnidad?.unidad_organizacional?.area?.descripcion || 'Sin descripción de área';

        filasHTML += `
        <tr style="background-color:#d9edf7; font-weight:bold;">
          <td colspan="5">Área: ${areaCodigo} - ${descripcionArea}</td>
        </tr>
      `;

        for (const [unidadCodigo, ambientesUnidad] of Object.entries(unidades)) {
          // 👉 Tomar la descripción de la unidad organizacional (del primer ambiente)
          const descripcionUnidad = ambientesUnidad[0]?.unidad_organizacional?.descripcion || 'Sin descripción de UO';

          filasHTML += `
          <tr style="background-color:#f2f2f2; font-style:italic;">
            <td colspan="5">Unidad Organizacional: ${unidadCodigo} - ${descripcionUnidad}</td>
          </tr>
        `;

          for (const ambiente of ambientesUnidad) {
            filasHTML += `
            <tr>
              <td>${index++}</td>
              <td>${ambiente.codigo}</td>
              <td>${ambiente.descripcion}</td>
            </tr>
          `;
          }
        }
      }

      // 4️⃣ Cargar logo e insertar HTML en la plantilla
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

      // 5️⃣ Generar el PDF
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
