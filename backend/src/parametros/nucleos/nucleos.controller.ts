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
import { Nucleo } from './entities/nucleos.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateNucleosDto } from './dto/create-nucleos.dto';
import { UpdateNucleosDto } from './dto/update-nucleos.dto';
import { NucleosService } from './nucleos.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/nucleos')
@UseGuards(JwtAuthGuard)
export class NucleosController {
  constructor(
    private readonly direccionesService: NucleosService,

    @InjectRepository(Nucleo)
    private readonly areaRepository: Repository<Nucleo>,
  ) { }

  @Post()
  create(
    @Body() dto: CreateNucleosDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.create(dto, userId);
  }

  @Get('verificar-codigo/:codigo')
  async verificarCodigo(@Param('codigo') codigo: string) {
    const existe = await this.areaRepository.findOneBy({
      codigo: codigo.trim().toUpperCase(),
    });

    return { disponible: !existe };
  }


  @Get()
  findAll(@Req() req: RequestWithUser): Promise<Nucleo[]> {
    const estado = req.query.estado as string;
    return this.direccionesService.findAll(estado);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.direccionesService.findOne(id);
  }

  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estado: string,
  ) {
    try {
      const nucleos = await this.direccionesService.findAll(estado);

      const filasHTML = nucleos.map((nucleo, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${nucleo.codigo}</td>
        <td>${nucleo.descripcion}</td>        
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

      const templatePath = path.join(process.cwd(), 'templates', 'pdf', 'parametros', 'nucleos-pdf.html');
      let html: string;

      try {
        html = fs.readFileSync(templatePath, 'utf-8');
      } catch (e) {
        console.error('❌ No se encontró la plantilla:', templatePath);
        throw new Error('Plantilla HTML no encontrada');
      }

      html = html.replace('<!-- FILAS_NUCLEOS -->', filasHTML);
      html = html.replace('__LOGO__', logoDataURL);

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=nucleos.pdf');
      res.end(buffer);
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al exportar PDF' });
    }
  }


  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNucleosDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.direccionesService.update(id, dto, userId);
  }


  @Put(':id/cambiar-estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.direccionesService.cambiarEstado(id, userId);
  }
}
