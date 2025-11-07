import {
  Controller, Get, Post, Body, Put, Param, ParseIntPipe, UseGuards, Req, Query, Res
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distrito } from './entities/distritos.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateDistritosDto } from './dto/create-distritos.dto';
import { UpdateDistritosDto } from './dto/update-distritos.dto';
import { DistritosService } from './distritos.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';
import { ILike } from 'typeorm';


@Controller('parametros/distritos')
@UseGuards(JwtAuthGuard)
export class DistritosController {
  constructor(
    private readonly distritosService: DistritosService,
    @InjectRepository(Distrito)
    private readonly ciudadRepository: Repository<Distrito>,
  ) { }

  @Post()
  create(@Body() dto: CreateDistritosDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.distritosService.create(dto, userId);
  }

  @Get('verificar-codigo/:codigo')
  async verificarCodigo(@Param('codigo') codigo: string) {
    const codigoNormalizado = codigo.trim().toUpperCase();
    const existe = await this.ciudadRepository.findOneBy({ codigo: codigoNormalizado });

    if (existe) {
      return { disponible: false, message: `El código ${codigoNormalizado} ya está registrado.` };
    }

    return { disponible: true, message: `El código ${codigoNormalizado} está disponible.` };
  }


  @Get()
  findAll(@Req() req: RequestWithUser) {
    const estado = req.query.estado as string;
    return this.distritosService.findAll(estado);
  }

  @Get('buscar')
  async buscarDistritos(@Query('q') q: string) {
    const distritos = await this.ciudadRepository.find({
      where: { descripcion: ILike(`%${q}%`) },
      take: 10,
    });
    return { data: distritos };
  }



  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.distritosService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDistritosDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.distritosService.update(id, dto, userId);
  }

  @Put(':id/cambiar-estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.distritosService.cambiarEstado(id, userId);
  }

  @Get('exportar/pdf')
  async exportarPDF(@Res() res: Response, @Query('estado') estado: string) {
    try {
      const ciudades = await this.distritosService.findAll(estado);

      const filasHTML = ciudades.map((ciudad, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${ciudad.codigo}</td>
          <td>${ciudad.descripcion}</td>          
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

      const templatePath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'distritos-pdf.html');
      let html = fs.readFileSync(templatePath, 'utf-8');
      html = html.replace('<!-- FILAS_DISTRITOS -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=ciudades.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
