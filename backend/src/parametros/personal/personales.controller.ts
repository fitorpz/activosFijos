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



  // Exportar en PDF
  @Get('exportar/pdf')
  async exportarPDF(@Res() res: Response, @Query('estado') estado: string) {
    try {
      const personales = await this.personalesService.findAll();
      const logoPath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'escudo.png');
      let logoDataURL = '';
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        logoDataURL = `data:image/png;base64,${logoBase64}`;
      } catch (e) {
        console.error('❌ No se pudo cargar el logo:', logoPath);
      }

      const filasHTML = personales
        .filter(p => estado === 'todos' || p.estado === estado.toUpperCase())
        .map((p, i) => `
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
          </tr>
        `).join('');

      const html = `
        <html>
          <body>
            <img src="${logoDataURL}" style="width:100px;">
            <table>${filasHTML}</table>
          </body>
        </html>`;

      const pdfBuffer = await generarPDFDesdeHTML(html);
      res.set({ 'Content-Type': 'application/pdf' });
      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException('Error al generar el PDF', HttpStatus.INTERNAL_SERVER_ERROR);
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
