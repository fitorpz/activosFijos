// src/tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Edificio } from '../activosFijos/edificios/entities/edificio.entity';
import { UnidadOrganizacional } from '../parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { UnidadesOrganizacionalesModule } from '../parametros/unidades-organizacionales/unidades-organizacionales.module'; // importa el módulo completo

@Module({
    imports: [
        TypeOrmModule.forFeature([Edificio, UnidadOrganizacional]),
        UnidadesOrganizacionalesModule, // ✅ IMPORTANTE
    ],
    controllers: [TicketsController],
    providers: [TicketsService],
})
export class TicketsModule { }
