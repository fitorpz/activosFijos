import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Req,
    UseGuards,
    ParseIntPipe,
    Query,
    Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdificiosService } from './edificios.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import { Edificio } from './entities/edificio.entity';
import type { RequestWithUser } from '../../interfaces/request-with-user.interface';

// ⬇️ IMPORTS para generación de PDF
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('edificios')
@UseGuards(AuthGuard('jwt'))
export class EdificiosController {
    constructor(
        private readonly edificiosService: EdificiosService,
        @InjectRepository(Edificio)
        private readonly edificioRepository: Repository<Edificio>,
    ) { }

    @Post()
    async create(@Body() dto: CreateEdificioDto, @Req() req: RequestWithUser) {
        const userId = req.user.id;
        const result = await this.edificiosService.create(dto, userId);
        return {
            message: 'Edificio creado correctamente',
            data: result,
        };
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: RequestWithUser,
    ) {
        const result = await this.edificiosService.findOne(id);
        return {
            message: 'Edificio encontrado',
            data: result,
        };
    }

    @Get()
    async findAll(@Query('estado') estado?: string) {
        const edificios = await this.edificiosService.findAll(estado);
        const resultado = edificios.map((e) => ({
            ...e,
            creado_por: e.creadoPor?.nombre || null,
            actualizado_por: e.actualizadoPor?.nombre || null,
        }));

        return {
            message: 'Listado de edificios',
            data: resultado,
        };
    }

    @Get('siguiente-codigo')
    async getSiguienteCodigo(
        @Query('prefijo') prefijo: string,
    ): Promise<{ correlativo: string }> {
        const last = await this.edificioRepository
            .createQueryBuilder('edificio')
            .where('edificio.codigo_311 LIKE :prefijo', { prefijo: `${prefijo}.%` })
            .orderBy('edificio.codigo_311', 'DESC')
            .getOne();

        let correlativo = '0001';
        if (last) {
            const partes = last.codigo_311.split('.');
            const ultCorrelativo = partes[partes.length - 1];
            correlativo = (parseInt(ultCorrelativo) + 1).toString().padStart(4, '0');
        }

        return { correlativo };
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEdificioDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = req.user.id;
        const result = await this.edificiosService.update(id, dto, userId);
        return {
            message: `Edificio con ID ${id} actualizado correctamente`,
            data: result,
        };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const result = await this.edificiosService.remove(id);
        return result;
    }

    @Put('restaurar/:id')
    async restore(@Param('id', ParseIntPipe) id: number) {
        const result = await this.edificiosService.restore(id);
        return result;
    }

    // ✅ Exportar PDF (nuevo método completo y corregido)
    @Get('exportar/pdf')
    async exportarPDF(@Res() res: Response, @Query('estado') estado: string) {
        try {
            const edificios = await this.edificiosService.findAll(estado); // ✅ ahora filtra por estado

            const filasHTML = edificios
                .map(
                    (e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e.codigo_311 || '-'}</td>
        <td>${e.descripcion_edificio || 'Sin descripción'}</td>
        <td>${e.nombre_area || '-'}</td>
        <td>${(e as any).unidad_organizacional_nombre || '-'}</td>
        <td>${(e as any).ambiente_nombre || '-'}</td>
        <td>${e.estado || '-'}</td>
      </tr>
    `,
                )
                .join('');

            const templatePath = path.join(
                process.cwd(),
                'templates',
                'pdf',
                'activosFijos',
                'edificios-pdf.html',
            );

            let html = fs.readFileSync(templatePath, 'utf-8');
            html = html.replace('<!-- FILAS_EDIFICIOS -->', filasHTML);

            const buffer = await generarPDFDesdeHTML(html);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=edificios.pdf');
            res.end(buffer);
        } catch (error) {
            console.error('❌ Error al generar PDF de edificios:', error);
            return res.status(500).json({ message: 'Error al exportar PDF' });
        }
    }

}
