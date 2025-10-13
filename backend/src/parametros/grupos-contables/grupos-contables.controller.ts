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
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoContable } from './entities/grupos-contables.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermisosGuard } from 'src/usuarios/guards/permisos.guard';
import { TienePermiso } from 'src/usuarios/decorators/tiene-permiso.decorator';
import { CreateGruposContablesDto } from './dto/create-grupos-contables.dto';
import { UpdateGruposContablesDto } from './dto/update-grupos-contables.dto';
import { GruposContablesService } from './grupos-contables.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/grupos-contables')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class GruposContablesController {
  constructor(
    private readonly gruposService: GruposContablesService,

    @InjectRepository(GrupoContable)
    private readonly grupoRepository: Repository<GrupoContable>,
  ) { }

  // 🟩 Crear nuevo grupo contable
  @Post()
  @TienePermiso('grupos-contables:crear')
  create(
    @Body() dto: CreateGruposContablesDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.gruposService.create(dto, userId);
  }

  // 🟦 Listar todos los grupos contables
  @Get()
  @TienePermiso('grupos-contables:listar')
  findAll(@Query('estado') estado: string) {
    return this.gruposService.findAll(estado);
  }

  // 🟨 Sugerir código disponible
  @Get('sugerir-codigo')
  @TienePermiso('grupos-contables:listar')
  async sugerirCodigo(@Query('codigo') codigo: string) {
    if (!codigo) throw new BadRequestException('Código base requerido');
    const sugerido = await this.gruposService.sugerirCodigoDisponible(codigo);
    return { sugerido };
  }

  // 🟧 Obtener un grupo contable por ID
  @Get(':id')
  @TienePermiso('grupos-contables:listar')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.findOne(id);
  }

  // 🟨 Actualizar grupo contable
  @Put(':id')
  @TienePermiso('grupos-contables:editar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGruposContablesDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.gruposService.update(id, dto, userId);
  }

  // ⚙️ Cambiar estado (activar / desactivar)
  @Put(':id/cambiar-estado')
  @TienePermiso('grupos-contables:cambiar-estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.gruposService.cambiarEstado(id, userId);
  }

  // 🟥 Eliminar grupo contable
  @Delete(':id')
  @TienePermiso('grupos-contables:editar') // puedes usar 'eliminar' si lo agregas al seed
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.remove(id);
  }

  // 📄 Exportar PDF
  @Get('exportar/pdf')
  @TienePermiso('grupos-contables:exportar-pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string,
  ) {
    try {
      const grupos = await this.gruposService.findAll(estado);

      // Ordenar por código ascendente
      grupos.sort((a, b) => {
        if (a.codigo < b.codigo) return -1;
        if (a.codigo > b.codigo) return 1;
        return 0;
      });

      const logoPath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'escudo.png'
      );

      let logoDataURL = '';
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        logoDataURL = `data:image/png;base64,${logoBase64}`;
      } catch (e) {
        console.error('❌ No se pudo cargar el logo:', logoPath);
      }

      // Generar filas HTML
      const filasHTML = grupos
        .map((grupo, index) => {
          const esCodigoTresDigitos = /^\d{3}$/.test(grupo.codigo);
          const estiloFila = esCodigoTresDigitos
            ? 'font-weight: bold; font-size: 16px;'
            : '';

          return `
            <tr style="${estiloFila}">
              <td>${index + 1}</td>
              <td>${grupo.codigo}</td>
              <td>${grupo.descripcion}</td>
              <td style="text-align: right;">${grupo.tiempo}</td>
              <td style="text-align: right;">${grupo.porcentaje}%</td>
            </tr>
          `;
        })
        .join('');

      const templatePath = path.join(
        process.cwd(),
        'templates',
        'pdf',
        'parametros',
        'grupos-contables-pdf.html'
      );

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ Plantilla PDF no encontrada:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_GRUPOS_CONTABLES -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename=grupos-contables.pdf'
      );
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
