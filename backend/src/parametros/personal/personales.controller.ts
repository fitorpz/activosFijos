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
  HttpException,
  HttpStatus,
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
    private readonly personalesService: PersonalesService,

    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) { }

  // Crear nuevo personal
  @Post()
  async create(@Body() dto: CreatePersonalesDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.personalesService.create(dto, userId);
  }

  // Obtener todos los registros
  @Get()
  async findAll(): Promise<Personal[]> {
    return this.personalesService.findAll();
  }

  @Get('activos')
  async findActivos(): Promise<Personal[]> {
    return this.personalRepository.find({
      where: { estado: 'ACTIVO' },
      relations: ['usuario'],
    });
  }


  // Obtener usuarios disponibles, excluyendo opcionalmente uno
  @Get('usuarios-disponibles')
  async obtenerUsuariosDisponibles() {
    return this.personalesService.obtenerUsuariosDisponibles();
  }



  // Obtener personal por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalesService.findOne(id);
  }

  @Put(':id/cambiar-estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.personalesService.cambiarEstado(id, userId);
  }

  // Actualizar personal
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalesDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.personalesService.update(id, dto, userId);
  }






  // Eliminar personal (borrado lógico recomendado)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.personalesService.remove(id);
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

      const personales = await this.personalesService.findAll();
      const filtrados = estado
        ? personales.filter(p => p.estado === estado)
        : personales;

      const filasHTML = filtrados
        .map(
          (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.expedido ?? ''}</td>
          <td>${p.ci ?? ''}</td>
          <td>${p.nombre ?? ''}</td>
          <td>${p.profesion ?? ''}</td>
          <td>${p.direccion ?? ''}</td>
          <td>${p.celular ?? ''}</td>
          <td>${p.telefono ?? ''}</td>
          <td>${p.email ?? ''}</td>
          <td>${p.fecnac ?? ''}</td>
          <td>${this.obtenerEstadoCivil(p.estciv)}</td>
          <td>${this.obtenerSexo(p.sexo)}</td>
          <td>${p.estado ?? ''}</td>
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
        console.error('❌ No se pudo cargar el logo:', logoPath);
      }

      const templatePath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'personales-pdf.html',
      );

      let html = '';
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ Plantilla PDF no encontrada:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_PERSONALES -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);
      html = html.replace(
        '__FILTRO_ESTADO__',
        estado
          ? `Mostrando personales ${estado.toLowerCase()}`
          : 'Mostrando todos los personales',
      );

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=personales.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }


  private obtenerEstadoCivil(estciv?: number): string {
    switch (estciv) {
      case 1: return 'Soltero';
      case 2: return 'Casado';
      case 3: return 'Viudo';
      case 4: return 'Divorciado';
      case 5: return 'Unión libre';
      default: return 'No definido';
    }
  }

  private obtenerSexo(sexo?: number): string {
    switch (sexo) {
      case 1: return 'Masculino';
      case 2: return 'Femenino';
      default: return 'No definido';
    }
  }
}
