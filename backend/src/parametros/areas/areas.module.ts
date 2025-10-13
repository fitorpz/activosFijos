import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { Area } from './entities/areas.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area, 
      Usuario,
    ]),
  ],
  exports: [TypeOrmModule],
  controllers: [AreasController],
  providers: [AreasService],
})
export class AreasModule { }
