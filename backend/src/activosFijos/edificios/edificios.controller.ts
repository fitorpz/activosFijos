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
} from '@nestjs/common';
import type { Response } from 'express';
import {
    FileInterceptor,
    FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Express } from 'express';

import { EdificiosService } from './edificios.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';

@Controller('activos-fijos/edificios')
export class EdificiosController {
    constructor(private readonly edificiosService: EdificiosService) { }

    // 🔹 Crear nuevo edificio con codificación GAMS
    @Post()
    async create(@Body() createEdificioDto: CreateEdificioDto) {
        const edificio = await this.edificiosService.create(createEdificioDto);
        return {
            message: 'Edificio creado correctamente',
            codigo: edificio.codigo_completo,
            data: edificio,
        };
    }

    // 🔹 Listar todos los edificios
    @Get()
    async findAll() {
        const edificios = await this.edificiosService.findAll();
        return {
            total: edificios.length,
            data: edificios,
        };
    }

    // 🔹 Buscar un edificio por ID
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const edificio = await this.edificiosService.findOne(id);
        return {
            message: 'Edificio encontrado',
            data: edificio,
        };
    }

    // 🔹 Actualizar edificio
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEdificioDto: UpdateEdificioDto,
    ) {
        const edificio = await this.edificiosService.update(id, updateEdificioDto);
        return {
            message: 'Edificio actualizado correctamente',
            codigo: edificio.codigo_completo,
            data: edificio,
        };
    }

    // 🔹 Eliminar edificio (borrado lógico)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.edificiosService.remove(id);
        return { message: `Edificio con ID ${id} eliminado correctamente` };
    }

    // 🔹 Cambiar estado (ACTIVO / INACTIVO)
    @Put(':id/cambiar-estado')
    async cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body('userId', ParseIntPipe) userId: number,
    ) {
        const edificio = await this.edificiosService.cambiarEstado(id, userId);
        return {
            message: `Estado cambiado a ${edificio.estado}`,
            data: edificio,
        };
    }

    // 🔹 Exportar listado a PDF
    @Get('exportar/pdf')
    async exportarPdf(@Res() res: Response, @Query('estado') estado: string) {
        const pdfBuffer = await this.edificiosService.exportarPdf(estado);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="edificios.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    // 🔹 Subir archivo PDF de respaldo
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
    async uploadPdf(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('No se envió ningún archivo');
        const filePath = `/uploads/edificios/pdf/${file.filename}`;
        const actualizado = await this.edificiosService.actualizarArchivoPdf(
            id,
            filePath,
        );
        return {
            message: 'Archivo PDF actualizado correctamente',
            data: actualizado,
        };
    }

    // 🔹 Subir fotos del edificio
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
