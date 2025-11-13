import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    ParseIntPipe,
    Res,
    Query,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
    FileInterceptor,
    FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { EdificiosService } from './edificios.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import { generarPDFDesdeHTML } from 'src/pdf/generarPDF';

@Controller('activos-fijos/edificios')
export class EdificiosController {
    constructor(private readonly edificiosService: EdificiosService) { }

    // 🧱 Crear nuevo edificio
    @Post()
    async create(@Body() createEdificioDto: CreateEdificioDto) {
        const edificio = await this.edificiosService.create(createEdificioDto);
        return {
            message: 'Edificio creado correctamente',
            codigo: edificio.codigo_completo,
            data: edificio,
        };
    }

    // 📋 Listar todos los edificios
    @Get()
    async findAll() {
        const edificios = await this.edificiosService.findAll();
        return {
            total: edificios.length,
            data: edificios,
        };
    }

    // 🔢 Obtener correlativo disponible
    @Get('siguiente-correlativo')
    async obtenerSiguienteCorrelativo() {
        const data = await this.edificiosService.generarCorrelativoUnico();
        return {
            message: 'Correlativo generado correctamente',
            data,
        };
    }




    // 📄 Exportar LISTADO PDF de todos los edificios
    @Get('exportar/pdf')
    async exportarListadoPDF(@Res() res: Response, @Query('estado') estadoQuery?: string) {
        try {
            const estado =
                estadoQuery?.toUpperCase() === 'ACTIVO'
                    ? 'ACTIVO'
                    : estadoQuery?.toUpperCase() === 'INACTIVO'
                        ? 'INACTIVO'
                        : undefined;

            const edificios = await this.edificiosService.findAll();
            const filtrados = estado ? edificios.filter(e => e.estado === estado) : edificios;

            const filasHTML = filtrados
                .map(
                    (e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${e.codigo_completo ?? ''}</td>
            <td>${e.nombre_bien ?? ''}</td>
            <td>${e.clasificacion ?? ''}</td>
            <td>${e.unidad_organizacional?.descripcion ?? ''}</td>
            <td>${e.ubicacion ?? ''}</td>
            <td><span>${e.estado ?? ''}</span></td>
          </tr>`,
                )
                .join('');

            const logoPath = path.join(process.cwd(), 'templates', 'pdf', 'activosFijos', 'escudo.png');
            let logoDataURL = '';
            try {
                const logoBuffer = fs.readFileSync(logoPath);
                logoDataURL = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            } catch {
                console.warn('⚠️ Logo no encontrado en', logoPath);
            }

            const templatePath = path.join(
                process.cwd(),
                'templates',
                'pdf',
                'activosFijos',
                'edificios-pdf.html',
            );
            let html = fs.readFileSync(templatePath, 'utf-8');

            html = html.replace('<!-- FILAS_EDIFICIOS -->', filasHTML);
            html = html.replace('__LOGO__', logoDataURL);
            html = html.replace(
                '__FILTRO_ESTADO__',
                estado
                    ? `Mostrando edificios ${estado.toLowerCase()}`
                    : 'Mostrando todos los edificios',
            );

            const buffer = await generarPDFDesdeHTML(html);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=edificios.pdf');
            res.end(buffer);
        } catch (error) {
            console.error('❌ Error al exportar listado PDF:', error);
            throw new InternalServerErrorException('Error al exportar listado de edificios');
        }
    }

    // 📄 Exportar FICHA PDF de un solo edificio
    @Get(':id/ficha-pdf')
    async exportarFichaPDF(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        try {
            console.log('🧾 Generando ficha PDF para edificio ID:', id);

            const edificio = await this.edificiosService.findOne(id);
            if (!edificio) throw new NotFoundException('Edificio no encontrado');

            // 🔹 Logo institucional
            const logoPath = path.join(
                process.cwd(),
                'templates',
                'pdf',
                'activosFijos',
                'escudo.png',
            );
            let logoDataURL = '';
            try {
                const logoBuffer = fs.readFileSync(logoPath);
                logoDataURL = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            } catch (e) {
                console.warn('⚠️ No se encontró el logo en', logoPath);
            }

            // 🔹 Determinar imagen QR (base64 o URL)
            const qrImage =
                edificio.codigo_qr && edificio.codigo_qr.startsWith('data:image')
                    ? edificio.codigo_qr
                    : edificio.codigo_qr
                        ? `http://localhost:3001${edificio.codigo_qr}`
                        : 'https://via.placeholder.com/120x120.png?text=QR+no+disponible';

            // 🔹 Estilos globales
            const estilos = `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #333; margin: 40px; }
        h2 { text-align: center; color: #0d47a1; margin-bottom: 20px; }
        h3 { color: #1565c0; margin-top: 30px; border-bottom: 1px solid #1565c0; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td { padding: 6px 10px; vertical-align: top; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .logo { width: 80px; margin-bottom: 10px; }
        .seccion { margin-bottom: 20px; border-radius: 8px; padding: 10px 15px; background-color: #fafafa; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .qr { text-align: center; margin-top: 25px; }
        .qr img { border: 2px solid #ddd; border-radius: 8px; padding: 5px; background: #fff; width: 120px; height: 120px; }
        .footer { text-align: right; font-size: 11px; color: #777; margin-top: 25px; }
      </style>
    `;

            // 🔹 Construir HTML completo
            const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ficha Técnica del Edificio</title>
        ${estilos}
      </head>
      <body>
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${logoDataURL}" class="logo" alt="Logo"/>
          <h2>Ficha Técnica del Edificio</h2>
        </div>

        <div class="seccion">
          <table>
            <tr><td><b>Código GAMS:</b></td><td>${edificio.codigo_completo ?? '—'}</td></tr>
            <tr><td><b>Nombre del Bien:</b></td><td>${edificio.nombre_bien ?? '—'}</td></tr>
            <tr><td><b>Clasificación:</b></td><td>${edificio.clasificacion ?? '—'}</td></tr>
            <tr><td><b>Uso:</b></td><td>${edificio.uso ?? '—'}</td></tr>
          </table>
        </div>

        <h3>Ubicación y Administración</h3>
        <div class="seccion">
          <table>
            <tr><td><b>Unidad Organizacional:</b></td><td>${edificio.unidad_organizacional?.descripcion ?? '—'}</td></tr>
            <tr><td><b>Responsable:</b></td><td>${edificio.responsable?.nombre ?? '—'}</td></tr>
            <tr><td><b>Cargo:</b></td><td>${edificio.cargo?.cargo ?? '—'}</td></tr>
            <tr><td><b>Ubicación:</b></td><td>${edificio.ubicacion ?? '—'}</td></tr>
            <tr><td><b>Dirección Administrativa:</b></td><td>${edificio.codigo_direccion_administrativa ?? '—'}</td></tr>
            <tr><td><b>Distrito:</b></td><td>${edificio.codigo_distrito ?? '—'}</td></tr>
            <tr><td><b>Sector / Área:</b></td><td>${edificio.codigo_sector_area ?? '—'}</td></tr>
            <tr><td><b>Ambiente:</b></td><td>${edificio.codigo_ambiente ?? '—'}</td></tr>
          </table>
        </div>

        <h3>Datos de Ingreso</h3>
        <div class="seccion">
          <table>
            <tr><td><b>Ingreso:</b></td><td>${edificio.ingreso ?? '—'}</td></tr>
            <tr><td><b>Descripción Ingreso:</b></td><td>${edificio.descripcion_ingreso ?? '—'}</td></tr>
            <tr><td><b>Fecha Factura / Donación:</b></td><td>${edificio.fecha_factura_donacion ?? '—'}</td></tr>
            <tr><td><b>Nro. Factura:</b></td><td>${edificio.nro_factura ?? '—'}</td></tr>
            <tr><td><b>Proveedor / Donante:</b></td><td>${edificio.proveedor_donante ?? '—'}</td></tr>
          </table>
        </div>

        <h3>Respaldo Legal</h3>
        <div class="seccion">
          <table>
            <tr><td><b>Respaldo Legal:</b></td><td>${edificio.respaldo_legal ?? '—'}</td></tr>
            <tr><td><b>Descripción Respaldo:</b></td><td>${edificio.descripcion_respaldo_legal ?? '—'}</td></tr>
          </table>
        </div>

        <h3>Características Físicas</h3>
        <div class="seccion">
          <table>
            <tr><td><b>Superficie (m²):</b></td><td>${edificio.superficie ?? '—'}</td></tr>
            <tr><td><b>Valor (Bs):</b></td><td>${edificio.valor_bs ?? '—'}</td></tr>
            <tr><td><b>Vida útil (años):</b></td><td>${edificio.vida_util_anios ?? '—'}</td></tr>
            <tr><td><b>Estado de Conservación:</b></td><td>${edificio.estado_conservacion ?? '—'}</td></tr>
            <tr><td><b>Servicios:</b></td><td>${edificio.servicios?.join(', ') ?? '—'}</td></tr>
          </table>
        </div>

        <h3>Observaciones</h3>
        <div class="seccion">
          <table><tr><td>${edificio.observaciones ?? 'Sin observaciones'}</td></tr></table>
        </div>

        <div class="qr">
          <img src="${qrImage}" alt="QR del edificio"/>
          <div class="small">Escanea para ver detalles</div>
        </div>

        <div class="footer">
          <div><b>Estado:</b> ${edificio.estado ?? '—'}</div>
          <div><b>Creado:</b> ${new Date(edificio.created_at).toLocaleDateString('es-BO')}</div>
          ${edificio.updated_at
                    ? `<div><b>Actualizado:</b> ${new Date(edificio.updated_at).toLocaleDateString('es-BO')}</div>`
                    : ''
                }
        </div>
      </body>
      </html>
    `;

            // 🧾 Generar PDF
            const buffer = await generarPDFDesdeHTML(html);
            console.log('✅ Ficha técnica PDF generada correctamente');

            // 📨 Enviar PDF al navegador
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `inline; filename=ficha-edificio-${id}.pdf`,
            );
            res.end(buffer);
        } catch (error) {
            console.error('❌ Error al generar ficha PDF:', error);
            throw new InternalServerErrorException('Error al generar PDF del edificio');
        }
    }

    // 🔍 Buscar edificio por ID
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const edificio = await this.edificiosService.findOne(id);
        return { message: 'Edificio encontrado', data: edificio };
    }

    // 🔄 Actualizar edificio
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEdificioDto) {
        const edificio = await this.edificiosService.update(id, dto);
        return { message: 'Edificio actualizado correctamente', data: edificio };
    }

    // ❌ Eliminar edificio (borrado lógico)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.edificiosService.remove(id);
        return { message: `Edificio con ID ${id} eliminado correctamente` };
    }

    // 🔄 Cambiar estado
    @Put(':id/cambiar-estado')
    async cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body('userId', ParseIntPipe) userId: number,
    ) {
        const edificio = await this.edificiosService.cambiarEstado(id, userId);
        return { message: `Estado cambiado a ${edificio.estado}`, data: edificio };
    }

    // 📎 Subir archivo PDF
    @Post(':id/upload/pdf')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/edificios/pdf',
                filename: (req, file, cb) => {
                    const unique = Date.now() + extname(file.originalname);
                    cb(null, `pdf-${unique}`);
                },
            }),
        }),
    )
    async uploadPdf(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No se envió ningún archivo');
        const filePath = `/uploads/edificios/pdf/${file.filename}`;
        const actualizado = await this.edificiosService.actualizarArchivoPdf(id, filePath);
        return { message: 'Archivo PDF actualizado correctamente', data: actualizado };
    }

    // 📷 Subir fotos
    @Post(':id/upload/fotos')
    @UseInterceptors(
        FilesInterceptor('fotos', 5, {
            storage: diskStorage({
                destination: './uploads/edificios/fotos',
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `foto-${unique}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async uploadFotos(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0)
            throw new BadRequestException('No se enviaron fotos');
        const paths = files.map((f) => `/uploads/edificios/fotos/${f.filename}`);
        const actualizado = await this.edificiosService.actualizarFotos(id, paths);
        return {
            message: 'Fotos agregadas correctamente',
            cantidad: files.length,
            data: actualizado,
        };
    }
}
