import {
    Controller,
    Get,
    Query,
    UseGuards,
    Res,
    BadRequestException,
    ParseIntPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { generarPDFDesdeHTML } from '../pdf/generarPDF';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get('todos')
    async obtenerTodos() {
        return this.ticketsService.obtenerTodos();
    }

    @Get('filtrar')
    async filtrarPorFiltros(
        @Query('area_id', ParseIntPipe) area_id: number,
        @Query('unidad_id', ParseIntPipe) unidad_id: number,
        @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
        @Query('cargo_id', ParseIntPipe) cargo_id: number,
    ) {
        return this.ticketsService.filtrar(area_id, unidad_id, ambiente_id, cargo_id);
    }

    @Get('imprimir-multiple')
    async generarMultiplesTicketsPDF(
        @Query('ids') ids: string,
        @Res() res: Response,
    ) {
        if (!ids) {
            throw new BadRequestException('Debe enviar IDs separados por coma');
        }

        const idArray = ids
            .split(',')
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

        const edificios = await this.ticketsService.obtenerPorIds(idArray);

        if (!edificios.length) {
            throw new BadRequestException('No se encontraron edificios con los IDs dados');
        }

        // 🧠 Generar el QR y contenido HTML por edificio
        const filasHTML = await Promise.all(
            edificios.map(async (e, index) => {
                const contenidoQR = `${e.codigo_311} - ${e.descripcion_edificio || 'SIN DESCRIPCIÓN'} - ${(e as any).unidad_organizacional_nombre ?? '—'}`;
                const qrBase64 = await QRCode.toDataURL(contenidoQR);

                return `
                <div class="ticket">
                    <div class="codigo"><strong>${index + 1}.</strong> ${e.codigo_311}</div>
                    <div class="descripcion">${e.descripcion_edificio || 'SIN DESCRIPCIÓN'}</div>
                    <div><em>${(e as any).unidad_organizacional_nombre ?? '—'}</em></div>
                    <div class="qr">
                        <img src="${qrBase64}" alt="QR" width="80" height="80" />
                    </div>
                </div>
            `;
            })
        );

        // 📄 Leer plantilla HTML
        const templatePath = path.join(
            process.cwd(),
            'templates',
            'pdf',
            'tickets',
            'tickets-template.html',
        );

        let html: string;
        try {
            html = fs.readFileSync(templatePath, 'utf-8');
        } catch (error) {
            console.error('❌ Error al leer la plantilla HTML:', error);
            return res.status(500).send('No se pudo cargar la plantilla del PDF');
        }

        // 🧩 Inyectar contenido al HTML
        html = html.replace('<!-- TICKETS_AQUI -->', filasHTML.join(''));

        // 🖨️ Generar PDF
        try {
            console.log('✅ IDs recibidos:', ids);
            console.log('✅ Edificios encontrados:', edificios.length);
            const buffer = await generarPDFDesdeHTML(html);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=tickets-seleccionados.pdf');
            return res.end(buffer);
        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            return res.status(500).send('Error interno al generar el PDF');
        }
    }



}
