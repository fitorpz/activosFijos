import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Res,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Cargo } from './entities/cargos.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCargosDto } from './dto/create-cargos.dto';
import { UpdateCargosDto } from './dto/update-cargos.dto';
import { CargosService } from './cargos.service';
import type { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { generarPDFDesdeHTML } from '../../pdf/generarPDF';

@Controller('parametros/cargos')
@UseGuards(JwtAuthGuard)
export class CargosController {
  constructor(
    private readonly cargosService: CargosService,
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) { }

  @Post()
  create(@Body() dto: CreateCargosDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.cargosService.create(dto, userId);
  }

  @Get()
  findAll(@Query('estado') estado?: 'ACTIVO' | 'INACTIVO') {
    return this.cargosService.findAll(estado);
  }

  @Get('buscar')
  async buscarCargos(
    @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
    @Query('search') search: string,
  ) {
    return this.cargoRepository.find({
      where: [
        { ambiente_id, estado: 'ACTIVO', cargo: ILike(`%${search}%`) },
        { ambiente_id, estado: 'ACTIVO', codigo: ILike(`%${search}%`) },
      ],
      order: { codigo: 'ASC' },
      take: 10,
    });
  }

  @Get('buscar-por-ambiente')
  async buscarCargosDesdeEdificio(
    @Query('ambiente_id', ParseIntPipe) ambiente_id: number,
    @Query('q') q: string,
  ) {
    return this.cargosService.buscarPorAmbiente(ambiente_id, q);
  }

  @Get('siguiente-codigo')
  async siguienteCodigo(@Query('ambiente_codigo') ambienteCodigo: string) {
    if (!ambienteCodigo) {
      throw new Error('El parámetro ambiente_codigo es obligatorio');
    }
    return this.cargosService.generarCodigoPorAmbiente(ambienteCodigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cargosService.findOne(id);
  }

  @Put(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.cargosService.cambiarEstado(id, estado, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCargosDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.cargosService.update(id, dto, userId);
  }

  @Get('exportar/pdf')
  async exportarPDF(
    @Res() res: Response,
    @Query('estado') estadoQuery?: string,
  ) {
    try {
      const estado =
        estadoQuery?.toUpperCase() === "ACTIVO"
          ? "ACTIVO"
          : estadoQuery?.toUpperCase() === "INACTIVO"
            ? "INACTIVO"
            : undefined;

      // === 1) Obtener cargos con TODAS las relaciones ===
      const cargos = await this.cargosService.findAllConRelaciones(estado);

      if (!cargos.length) {
        return res.status(404).json({ message: "No hay cargos para exportar" });
      }

      const listaCompleta = cargos;

      // === 2) Orden jerárquico ===
      cargos.sort((a, b) => {
        return (
          a.area.localeCompare(b.area) ||
          a.unidad_organizacional.localeCompare(b.unidad_organizacional) ||
          a.ambiente.localeCompare(b.ambiente) ||
          a.codigo.localeCompare(b.codigo)
        );
      });

      // === 3) Agrupación jerárquica ===
      const agrupado: Record<string, Record<string, Record<string, Cargo[]>>> = {};

      for (const cargo of cargos) {
        if (!agrupado[cargo.area]) agrupado[cargo.area] = {};
        if (!agrupado[cargo.area][cargo.unidad_organizacional])
          agrupado[cargo.area][cargo.unidad_organizacional] = {};
        if (!agrupado[cargo.area][cargo.unidad_organizacional][cargo.ambiente])
          agrupado[cargo.area][cargo.unidad_organizacional][cargo.ambiente] = [];

        agrupado[cargo.area][cargo.unidad_organizacional][cargo.ambiente].push(
          cargo,
        );
      }

      let filasHTML = "";
      let contador = 1;

      // === 4) Generar HTML por niveles ===
      for (const [area, unidades] of Object.entries(agrupado)) {
        const regArea = listaCompleta.find((c) => c.area === area);
        const descripcionArea =
          regArea?.ambiente_relacion?.unidad_organizacional?.area?.descripcion ??
          "";

        filasHTML += `
        <tr>
          <td colspan="7" style="background:#cfe2ff;font-weight:bold;font-size:14px;">
            Área: ${area} ${descripcionArea ? " - " + descripcionArea : ""}
          </td>
        </tr>
      `;

        for (const [unidad, ambientes] of Object.entries(unidades)) {
          const regUnidad = listaCompleta.find(
            (c) => c.unidad_organizacional === unidad,
          );
          const descripcionUnidad =
            regUnidad?.ambiente_relacion?.unidad_organizacional?.descripcion ??
            "";

          filasHTML += `
          <tr>
            <td colspan="7" style="background:#e2e3e5;font-weight:bold;padding-left:20px;font-size:13px;">
              Unidad Organizacional: ${unidad} ${descripcionUnidad ? " - " + descripcionUnidad : ""
            }
            </td>
          </tr>
        `;

          for (const [ambiente, listaCargosAmb] of Object.entries(ambientes)) {
            const regAmb = listaCompleta.find((c) => c.ambiente === ambiente);
            const descripcionAmbiente =
              regAmb?.ambiente_relacion?.descripcion ?? "";

            filasHTML += `
            <tr>
              <td colspan="7" style="background:#f8f9fa;font-weight:bold;padding-left:40px;font-size:12.5px;">
                Ambiente: ${ambiente} ${descripcionAmbiente ? " - " + descripcionAmbiente : ""
              }
              </td>
            </tr>
          `;

            for (const cargo of listaCargosAmb) {
              filasHTML += `
              <tr>
                <td>${contador++}</td>
                <td>${cargo.codigo}</td>
                <td>${cargo.cargo || ""}</td>
                <td>${cargo.estado}</td>
              </tr>
            `;
            }
          }
        }
      }

      // === 5) Logo y plantilla ===
      const logoPath = path.join(
        process.cwd(),
        "templates",
        "pdf",
        "parametros",
        "escudo.png",
      );

      let logoDataURL = "";
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataURL = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      } catch { }

      const templatePath = path.join(
        process.cwd(),
        "templates",
        "pdf",
        "parametros",
        "cargos-pdf.html",
      );

      let html = fs.readFileSync(templatePath, "utf-8");

      html = html.replace("<!-- FILAS_CARGOS -->", filasHTML);
      html = html.replace("__LOGO__", logoDataURL);
      html = html.replace(
        "__FILTRO_ESTADO__",
        estado ? `Mostrando cargos ${estado.toLowerCase()}` : "Todos los cargos",
      );

      const buffer = await generarPDFDesdeHTML(html);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=cargos.pdf");
      res.end(buffer);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      return res.status(500).json({ message: "Error al exportar PDF" });
    }
  }
}
