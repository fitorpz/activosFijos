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
  Query,
  Req,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/areas.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAreasDto } from './dto/create-areas.dto';
import { UpdateAreasDto } from './dto/update-areas.dto';
import { AreasService } from './areas.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';


import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/areas')
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(
    private readonly direccionesService: AreasService,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) { }

  @Get('verificar-codigo')
  async verificarCodigo(@Query('codigo') codigo: string) {
    if (!codigo || codigo.trim() === '') {
      throw new BadRequestException('Código requerido');
    }

    const existe = await this.direccionesService.existeCodigo(codigo);
    return { disponible: !existe };
  }

  @Post()
  create(
    @Body() dto: CreateAreasDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.create(dto, userId);
  }

  // areas.controller.ts
  @Get()
  findAll(@Req() req: RequestWithUser): Promise<Area[]> {
    const estado = req.query.estado as string; // puede ser 'activos' | 'inactivos' | undefined
    return this.direccionesService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreasDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.update(id, dto, userId);
  }

  @Put(':id/cambiar-estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.id;
    return this.direccionesService.cambiarEstado(id, userId);
  }





  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.remove(id);
  }



  // areas.controller.ts
  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string
  ) {
    try {
      // Obtener las áreas filtradas
      const areas = await this.direccionesService.findAll(estado);

      // Generar filas HTML
      const filasHTML = areas.map((area, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${area.codigo}</td>
          <td>${area.descripcion}</td>
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

      // Cargar archivo HTML base desde ruta relativa
      const templatePath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'areas-pdf.html');

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ No se encontró el archivo de plantilla HTML en:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }


      // Insertar las filas en el marcador
      html = html.replace('<!-- FILAS_AREAS -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      // Generar PDF con helper
      const buffer = await generarPDFDesdeHTML(html);

      // Enviar PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=areas.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
