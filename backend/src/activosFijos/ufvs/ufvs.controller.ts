import {
  Controller, Get, Post, Delete, Body, Put, Param, ParseIntPipe, UseGuards, Req, Query, Res
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ufv } from './entities/ufvs.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUfvsDto } from './dto/create-ufvs.dto';
import { UpdateUfvsDto } from './dto/update-ufvs.dto';
import { UfvsService } from './ufvs.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/ufvs')
@UseGuards(JwtAuthGuard)
export class UfvsController {
  constructor(
    private readonly ufvsService: UfvsService,
    @InjectRepository(Ufv)
    private readonly ufvRepository: Repository<Ufv>,
  ) { }

  @Post()
  create(@Body() dto: CreateUfvsDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.ufvsService.create(dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ufvsService.remove(id);
  }

  @Get('verificar-fecha/:fecha')
  async verificarFecha(@Param('fecha') fecha: Date) {
    const existe = await this.ufvRepository.findOneBy({
      //fecha: fecha.trim().toUpperCase(),
      fecha: fecha,

    });
    return { disponible: !existe };
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const estado = req.query.estado as string;
    return this.ufvsService.findAll(estado);
  }

  @Get('actual')
  async obtenerUfvActual() {
    // Obtiene la última UFV registrada (más reciente por fecha)
    const ultimaUfv = await this.ufvRepository.find({
      order: { fecha: 'DESC' },
      take: 1,
    });

    if (!ultimaUfv.length) {
      return { valor: null, fecha: null };
    }

    return {
      valor: ultimaUfv[0].tc,
      fecha: ultimaUfv[0].fecha,
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ufvsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUfvsDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.ufvsService.update(id, dto, userId);
  }

  @Put(':id/cambiar-estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.ufvsService.cambiarEstado(id, userId);
  }

  @Get('exportar/pdf')
  //async exportarPDF(@Res() res: Response, @Query('estado') estado: string) {
  async exportarPDF(@Res() res: Response) {

    try {
      //const ufvs = await this.ufvsService.findAll(estado);
      const ufvs = await this.ufvsService.findAll();

      const filasHTML = ufvs.map((ufv, index) => `
        <tr>
          <td>${index + 1}</td>
           <td>${new Date(ufv.fecha).toLocaleDateString()}</td>
          <td>${ufv.tc}</td>          
        </tr>
      `).join('');

      const templatePath = path.join(process.cwd(), 'templates', 'pdf', 'activosFijos', 'ufv-pdf.html');

      let html = fs.readFileSync(templatePath, 'utf-8');
      html = html.replace('<!-- FILAS_UFVS -->', filasHTML);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=ufvs.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }



}
