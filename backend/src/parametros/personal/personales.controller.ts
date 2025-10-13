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
  Res
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from './entities/personales.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePersonalesDto } from './dto/create-personales.dto';
import { UpdatePersonalesDto } from './dto/update-personales.dto';
import { PersonalesService } from './personales.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/personal')
@UseGuards(JwtAuthGuard)
export class PersonalesController {
  constructor(
    private readonly direccionesService: PersonalesService,

    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) { }

  @Post()
  create(
    @Body() dto: CreatePersonalesDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.create(dto, userId);
  }

  @Get()
  findAll(): Promise<Personal[]> {
    return this.personalRepository.find();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.findOne(id);
  }

  @Get('exportar/pdf')
  async exportarPDF(@Res() res: Response, @Query('estado') estado: string) {
    try {
      const personales = await this.direccionesService.findAll(); // Puedes agregar filtro si lo deseas

      const filasHTML = personales
        .filter(p => estado === 'todos' || p.estado === estado.toUpperCase())
        .map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.documento ?? ''}</td>
      <td>${p.expedido ?? ''}</td>
      <td>${p.ci}</td>
      <td>${p.nombre}</td>
      <td>${p.profesion ?? ''}</td>
      <td>${p.direccion ?? ''}</td>
      <td>${p.celular ?? ''}</td>
      <td>${p.telefono ?? ''}</td>
      <td>${p.email ?? ''}</td>
      <td>${p.fecnac ?? ''}</td>
      <td>${p.estciv === 1 ? 'Soltero' :
            p.estciv === 2 ? 'Casado' :
              p.estciv === 3 ? 'Viudo' :
                p.estciv === 4 ? 'Divorciado' :
                  p.estciv === 5 ? 'Unión libre' :
                    'No definido'
          }</td>
      <td>${p.sexo === 1 ? 'Masculino' :
            p.sexo === 2 ? 'Femenino' :
              'No definido'
          }</td>
      <td>${p.estado}</td>
    </tr>
  `).join('');


      const templatePath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'personales-pdf.html');

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ No se encontró la plantilla:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_PERSONALES -->', filasHTML);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=personales.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalesDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.update(id, dto, userId);
  }

  @Put(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.cambiarEstado(id, userId);
  }
}
