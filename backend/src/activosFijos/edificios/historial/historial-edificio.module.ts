import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialEdificio } from './entities/historial-edificio.entity';
import { HistorialEdificioController } from './historial-edificio.controller';
import { HistorialEdificioService } from './historial-edificio.service';

@Module({
    imports: [TypeOrmModule.forFeature([HistorialEdificio])],
    controllers: [HistorialEdificioController],
    providers: [HistorialEdificioService],
    exports: [HistorialEdificioService],
})
export class HistorialEdificioModule { }
