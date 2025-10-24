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
import { EdificiosService } from './edificios.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import type { Express } from 'express';


@Controller('activos-fijos/edificios')
export class EdificiosController {
    constructor(private readonly edificiosService: EdificiosService) { }

    @Post()
    create(@Body() createEdificioDto: CreateEdificioDto) {
        return this.edificiosService.create(createEdificioDto);
    }

    @Get()
    findAll() {
        return this.edificiosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.edificiosService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEdificioDto: UpdateEdificioDto,
    ) {
        return this.edificiosService.update(id, updateEdificioDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.edificiosService.remove(id);
    }

    @Put(':id/cambiar-estado')
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body('userId', ParseIntPipe) userId: number,
    ) {
        return this.edificiosService.cambiarEstado(id, userId);
    }

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

    @Post(':id/upload/pdf')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/edificios/pdf',
            filename: (req, file, cb) => {
                const unique = Date.now() + extname(file.originalname);
                cb(null, `pdf-${unique}`);
            },
        }),
    }))
    async uploadPdf(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('No se envió ningún archivo');
        const filePath = `/uploads/edificios/pdf/${file.filename}`;
        return this.edificiosService.actualizarArchivoPdf(id, filePath);
    }

    @Post(':id/upload/fotos')
    @UseInterceptors(FilesInterceptor('fotos', 5, {
        storage: diskStorage({
            destination: './uploads/edificios/fotos',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `foto-${unique}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFotos(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) throw new BadRequestException('No se enviaron fotos');
        const paths = files.map((f) => `/uploads/edificios/fotos/${f.filename}`);
        return this.edificiosService.actualizarFotos(id, paths);
    }
}