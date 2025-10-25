import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialEdificio } from './entities/historial-edificio.entity';
import { HistorialEdificioService } from './historial-edificio.service';

@Module({
    imports: [TypeOrmModule.forFeature([HistorialEdificio])],
    providers: [HistorialEdificioService],
    exports: [HistorialEdificioService],
})
export class HistorialEdificioModule { }
