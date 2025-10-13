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
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auxiliar } from './entities/auxiliares.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAuxiliaresDto } from './dto/create-auxiliares.dto';
import { UpdateAuxiliaresDto } from './dto/update-auxiliares.dto';
import { AuxiliaresService } from './auxiliares.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';

import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/auxiliares')
@UseGuards(JwtAuthGuard)
export class AuxiliaresController {
  constructor(
    private readonly auxiliaresService: AuxiliaresService,

    @InjectRepository(Auxiliar)
    private readonly auxiliarRepository: Repository<Auxiliar>,
  ) { }

  @Post()
  create(
    @Body() dto: CreateAuxiliaresDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.auxiliaresService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('estado') estado: string,
    @Query('codigo_grupo') codigo_grupo?: string,
  ) {
    return this.auxiliaresService.findAll(estado, codigo_grupo);
  }


  @Get('siguiente-codigo')
  async obtenerSiguienteCodigo(@Query('codigo_grupo') codigo_grupo: string) {
    if (!codigo_grupo) {
      throw new Error('El código del grupo contable es obligatorio');
    }

    const correlativo = await this.auxiliaresService.getSiguienteCodigoAuxiliar(codigo_grupo);
    return { correlativo }; // ej: { correlativo: "0001" }
  }

  @Get('por-grupo')
  async getAuxiliaresPorGrupo(@Query('codigo_grupo') codigo_grupo: string) {
    if (!codigo_grupo) {
      throw new Error('Debe proporcionar el código del grupo contable');
    }
    return this.auxiliaresService.findByGrupo(codigo_grupo);
  }


  @Get('buscar')
  async buscarAuxiliares(
    @Query('search') search: string,
    @Query('estado') estado?: string,
    @Query('codigo_grupo') codigo_grupo?: string, // nuevo parámetro
  ) {
    return this.auxiliaresService.buscarAuxiliares(search, estado, codigo_grupo);
  }



  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auxiliaresService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuxiliaresDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.auxiliaresService.update(id, dto, userId);
  }

  @Put(':id/cambiar-estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.auxiliaresService.cambiarEstado(id, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auxiliaresService.remove(id);
  }

  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string,
    @Query('codigo_grupo') codigo_grupo?: string,
  ) {
    try {
      const auxiliares = await this.auxiliaresService.findAll(estado, codigo_grupo);

      const filasHTML = auxiliares.map((aux, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${aux.codigo}</td>
          <td>${aux.descripcion}</td>
          <td>${aux.codigo_grupo ?? '—'}</td>
          <td>${aux.estado}</td>
        </tr>
      `).join('');

      const templatePath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'auxiliares-pdf.html',
      );

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ Plantilla PDF no encontrada:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_AUXILIARES -->', filasHTML);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=auxiliares.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
