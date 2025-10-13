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
import { DireccionAdministrativa } from './entities/direcciones-administrativas.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateDireccionesAdministrativasDto } from './dto/create-direcciones-administrativa.dto';
import { UpdateDireccionesAdministrativasDto } from './dto/update-direcciones-administrativa.dto';
import { DireccionesAdministrativasService } from './direcciones-administrativas.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/direcciones-administrativas')
@UseGuards(JwtAuthGuard)
export class DireccionesAdministrativasController {
  constructor(
    private readonly direccionesService: DireccionesAdministrativasService,

    @InjectRepository(DireccionAdministrativa)
    private readonly direccionRepository: Repository<DireccionAdministrativa>,
  ) { }

  @Post()
  create(
    @Body() dto: CreateDireccionesAdministrativasDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.create(dto, userId);
  }

  @Get('verificar-codigo/:codigo')
  async verificarCodigo(@Param('codigo') codigo: string) {
    const existe = await this.direccionRepository.findOneBy({
      codigo: codigo.trim().toUpperCase(), // <-- normalizado
    });

    return { disponible: !existe };
  }



  @Get()
  findAll(@Req() req: RequestWithUser): Promise<DireccionAdministrativa[]> {
    const estado = req.query.estado as string;
    return this.direccionesService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDireccionesAdministrativasDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.update(id, dto, userId);
  }

  @Put(':id/cambiar-estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.cambiarEstado(id, userId);
  }



  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string,
  ) {
    try {
      const direcciones = await this.direccionesService.findAll(estado);

      const filasHTML = direcciones.map((direccion, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${direccion.codigo}</td>
          <td>${direccion.descripcion}</td>
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
      

      const templatePath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'direcciones-administrativas-pdf.html');

      let html: string;
      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ No se encontró la plantilla:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_DIRECCIONES -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=direcciones-administrativas.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }
}
