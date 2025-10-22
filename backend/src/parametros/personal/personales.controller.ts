import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
  Res,
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

  // 🟢 Crear nuevo personal
  @Post()
  async create(@Body() dto: CreatePersonalesDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.personalesService.create(dto, userId);
  }

  // 🟡 Obtener todos los registros
  @Get()
  async findAll(): Promise<Personal[]> {
    return this.personalesService.findAll();
  }

  // 🟢 Obtener usuarios disponibles (con opción de exclusión del actual)
  @Get('usuarios-disponibles')
  async obtenerUsuariosDisponibles(@Query('idPersonal') idPersonal?: string) {
    const id = idPersonal ? parseInt(idPersonal, 10) : undefined;
    return this.personalesService.obtenerUsuariosDisponibles(id);
  }

  // 🔍 Obtener un registro por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalesService.findOne(id);
  }

  // 🧾 Exportar listado en PDF
  @Get('exportar/pdf')
  async exportarPDF(@Res() res: Response, @Query('estado') estado: string) {
    try {
      const personales = await this.personalesService.findAll();

      const filasHTML = personales
        .filter((p) => estado === 'todos' || p.estado === estado.toUpperCase())
        .map(
          (p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.documento ?? ''}</td>
            <td>${p.expedido ?? ''}</td>
            <td>${p.ci ?? ''}</td>
            <td>${p.nombre ?? ''}</td>
            <td>${p.profesion ?? ''}</td>
            <td>${p.direccion ?? ''}</td>
            <td>${p.celular ?? ''}</td>
            <td>${p.telefono ?? ''}</td>
            <td>${p.email ?? ''}</td>
            <td>${p.fecnac ?? ''}</td>
            <td>${p.estciv === 1
              ? 'Soltero'
              : p.estciv === 2
                ? 'Casado'
                : p.estciv === 3
                  ? 'Viudo'
                  : p.estciv === 4
                    ? 'Divorciado'
                    : p.estciv === 5
                      ? 'Unión libre'
                      : 'No definido'
            }</td>
            <td>${p.sexo === 1
              ? 'Masculino'
              : p.sexo === 2
                ? 'Femenino'
                : 'No definido'
            }</td>
            <td>${p.estado}</td>
          </tr>
        `,
        )
        .join('');

      const templatePath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'personales-pdf.html',
      );

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

  // 🟠 Actualizar un registro
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalesDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.personalesService.update(id, dto, userId);
  }

  // 🔁 Cambiar estado ACTIVO/INACTIVO
  @Put(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.personalesService.cambiarEstado(id, userId);
  }
}
